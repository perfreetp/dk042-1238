import { Router, Response } from 'express';
import { runQuery } from '../db.js';
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

router.get('/favorites', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug, c.icon as category_icon,
        u.username as author_username, u.avatar as author_avatar,
        1 as is_favorited
      FROM favorites f
      LEFT JOIN projects p ON f.project_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE f.user_id = ? AND p.status = 'approved'
      ORDER BY f.created_at DESC
    `;
    const projects = await runQuery(sql, [req.user.id]);
    const mappedProjects = projects.map((p: any) => mapProject(p));
    res.json(successResponse(mappedProjects));
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json(errorResponse('获取收藏列表失败', 500));
  }
});

export default router;
