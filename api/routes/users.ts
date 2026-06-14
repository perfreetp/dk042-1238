import { Router, Response } from 'express';
import { runQuery, runUpdate } from '../db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { successResponse, errorResponse, mapUser, mapProject } from '../utils.js';

const router = Router();

router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const users = await runQuery(
      'SELECT id, username, email, avatar, bio, role, followers_count, following_count, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json(errorResponse('用户不存在', 404));
    }

    const user = mapUser(users[0]);
    res.json(successResponse(user));
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json(errorResponse('获取用户信息失败', 500));
  }
});

router.get('/:id/projects', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug, c.icon as category_icon,
        u.username as author_username, u.avatar as author_avatar
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.author_id = ? AND p.status = 'approved'
      ORDER BY p.created_at DESC
    `;
    const projects = await runQuery(sql, [id]);
    const mappedProjects = projects.map((p: any) => mapProject(p));
    res.json(successResponse(mappedProjects));
  } catch (err) {
    console.error('Get user projects error:', err);
    res.status(500).json(errorResponse('获取用户项目失败', 500));
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const { username, bio, avatar } = req.body;
    const userId = req.user.id;

    if (username && username.trim().length === 0) {
      return res.status(400).json(errorResponse('昵称不能为空', 400));
    }

    const existing = await runQuery('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
    if (existing.length > 0) {
      return res.status(400).json(errorResponse('该昵称已被使用', 400));
    }

    const currentUser = await runQuery('SELECT username, bio, avatar FROM users WHERE id = ?', [userId]);
    if (currentUser.length === 0) {
      return res.status(404).json(errorResponse('用户不存在', 404));
    }

    const finalUsername = username || currentUser[0].username;
    const finalBio = bio !== undefined ? bio : currentUser[0].bio;
    const finalAvatar = avatar || currentUser[0].avatar;

    await runUpdate(
      'UPDATE users SET username = ?, bio = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [finalUsername, finalBio, finalAvatar, userId]
    );

    const updated = await runQuery(
      'SELECT id, username, email, avatar, bio, role, followers_count, following_count, created_at FROM users WHERE id = ?',
      [userId]
    );
    const user = mapUser(updated[0]);
    res.json(successResponse(user, '个人信息更新成功'));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json(errorResponse('更新失败', 500));
  }
});

router.get('/favorites', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const userId = req.user.id;
    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug, c.icon as category_icon,
        u.username as author_username, u.email as author_email, u.avatar as author_avatar, u.bio as author_bio, u.role as author_role,
        u.followers_count as author_followers_count, u.following_count as author_following_count, u.created_at as author_created_at,
        1 as is_favorited,
        l.id IS NOT NULL as is_liked
      FROM favorites f
      LEFT JOIN projects p ON f.project_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN likes l ON l.project_id = p.id AND l.user_id = ?
      WHERE f.user_id = ? AND p.status = 'approved'
      ORDER BY f.created_at DESC
    `;
    const projects = await runQuery(sql, [userId, userId]);
    const mappedProjects = projects.map((p: any) => mapProject(p));
    res.json(successResponse(mappedProjects));
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json(errorResponse('获取收藏列表失败', 500));
  }
});

export default router;
