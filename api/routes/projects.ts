import { Router, Response } from 'express';
import { runQuery, runInsert, runUpdate } from '../db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { successResponse, errorResponse, mapProject, mapComment } from '../utils.js';
import type { CreateProjectRequest } from '../../shared/types/index.js';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = '1', 
      pageSize = '12', 
      categoryId, 
      sort = 'latest',
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;

    let whereClause = "WHERE p.status = 'approved'";
    const params: any[] = [];

    if (categoryId) {
      whereClause += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'hot') {
      orderBy = '(p.likes_count + p.favorites_count * 2 + p.views_count / 10) DESC';
    } else if (sort === 'views') {
      orderBy = 'p.views_count DESC';
    } else if (sort === 'likes') {
      orderBy = 'p.likes_count DESC';
    }

    const userId = req.user?.id;
    const likeJoin = userId ? `LEFT JOIN likes l ON l.project_id = p.id AND l.user_id = ${userId}` : '';
    const favoriteJoin = userId ? `LEFT JOIN favorites f ON f.project_id = p.id AND f.user_id = ${userId}` : '';
    const likeField = userId ? ', l.id IS NOT NULL as is_liked' : '';
    const favoriteField = userId ? ', f.id IS NOT NULL as is_favorited' : '';

    const countSql = `SELECT COUNT(*) as total FROM projects p ${whereClause}`;
    const countResult = await runQuery(countSql, params);
    const total = countResult[0].total;

    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.description as category_description, c.project_count as category_project_count,
        u.username as author_username, u.email as author_email, u.avatar as author_avatar, u.bio as author_bio, u.role as author_role,
        u.followers_count as author_followers_count, u.following_count as author_following_count, u.created_at as author_created_at
        ${likeField}${favoriteField}
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      ${likeJoin}
      ${favoriteJoin}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const projects = await runQuery(sql, [...params, pageSizeNum, offset]);
    const mappedProjects = projects.map((p: any) => mapProject(p));

    res.json(successResponse({
      items: mappedProjects,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: offset + pageSizeNum < total
    }));
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json(errorResponse('获取项目列表失败', 500));
  }
});

router.get('/hot', async (req, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug, c.icon as category_icon,
        u.username as author_username, u.avatar as author_avatar
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'approved'
      ORDER BY (p.likes_count + p.favorites_count * 2 + p.views_count / 10) DESC
      LIMIT ?
    `;
    const projects = await runQuery(sql, [limit]);
    const mappedProjects = projects.map((p: any) => mapProject(p));
    res.json(successResponse(mappedProjects));
  } catch (err) {
    console.error('Get hot projects error:', err);
    res.status(500).json(errorResponse('获取热门项目失败', 500));
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const likeJoin = userId ? `LEFT JOIN likes l ON l.project_id = p.id AND l.user_id = ${userId}` : '';
    const favoriteJoin = userId ? `LEFT JOIN favorites f ON f.project_id = p.id AND f.user_id = ${userId}` : '';
    const likeField = userId ? ', l.id IS NOT NULL as is_liked' : '';
    const favoriteField = userId ? ', f.id IS NOT NULL as is_favorited' : '';

    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.description as category_description, c.project_count as category_project_count,
        u.username as author_username, u.email as author_email, u.avatar as author_avatar, u.bio as author_bio, u.role as author_role,
        u.followers_count as author_followers_count, u.following_count as author_following_count, u.created_at as author_created_at
        ${likeField}${favoriteField}
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      ${likeJoin}
      ${favoriteJoin}
      WHERE p.id = ?
    `;

    const projects = await runQuery(sql, [id]);

    if (projects.length === 0) {
      return res.status(404).json(errorResponse('项目不存在', 404));
    }

    await runUpdate('UPDATE projects SET views_count = views_count + 1 WHERE id = ?', [id]);

    const project = mapProject(projects[0]);
    res.json(successResponse(project));
  } catch (err) {
    console.error('Get project detail error:', err);
    res.status(500).json(errorResponse('获取项目详情失败', 500));
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const data: CreateProjectRequest = req.body;
    const coverImage = req.body.coverImage || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20project%20thumbnail&image_size=square';
    const screenshots = JSON.stringify(req.body.screenshots || []);
    const tags = JSON.stringify(data.tags || []);
    const techStack = JSON.stringify(data.techStack || []);
    const changelog = JSON.stringify(data.changelog || []);

    const projectId = await runInsert(
      `INSERT INTO projects (
        title, description, cover_image, screenshots, category_id, author_id,
        experience_url, experience_type, is_free, usage_limit, tech_stack,
        open_source_url, license, tags, changelog
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title, data.description, coverImage, screenshots, data.categoryId, req.user.id,
        data.experienceUrl, data.experienceType, data.isFree ? 1 : 0, data.usageLimit, techStack,
        data.openSourceUrl, data.license, tags, changelog
      ]
    );

    res.json(successResponse({ id: projectId }, '项目提交成功，等待审核'));
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json(errorResponse('创建项目失败', 500));
  }
});

router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const { id } = req.params;
    const userId = req.user.id;

    const existingLikes = await runQuery(
      'SELECT id FROM likes WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );

    if (existingLikes.length > 0) {
      await runUpdate('DELETE FROM likes WHERE user_id = ? AND project_id = ?', [userId, id]);
      await runUpdate('UPDATE projects SET likes_count = likes_count - 1 WHERE id = ?', [id]);
      res.json(successResponse({ liked: false }, '已取消点赞'));
    } else {
      await runInsert('INSERT INTO likes (user_id, project_id) VALUES (?, ?)', [userId, id]);
      await runUpdate('UPDATE projects SET likes_count = likes_count + 1 WHERE id = ?', [id]);
      res.json(successResponse({ liked: true }, '点赞成功'));
    }
  } catch (err) {
    console.error('Like project error:', err);
    res.status(500).json(errorResponse('操作失败', 500));
  }
});

router.post('/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const { id } = req.params;
    const userId = req.user.id;

    const existingFavorites = await runQuery(
      'SELECT id FROM favorites WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );

    if (existingFavorites.length > 0) {
      await runUpdate('DELETE FROM favorites WHERE user_id = ? AND project_id = ?', [userId, id]);
      await runUpdate('UPDATE projects SET favorites_count = favorites_count - 1 WHERE id = ?', [id]);
      res.json(successResponse({ favorited: false }, '已取消收藏'));
    } else {
      await runInsert('INSERT INTO favorites (user_id, project_id) VALUES (?, ?)', [userId, id]);
      await runUpdate('UPDATE projects SET favorites_count = favorites_count + 1 WHERE id = ?', [id]);
      res.json(successResponse({ favorited: true }, '收藏成功'));
    }
  } catch (err) {
    console.error('Favorite project error:', err);
    res.status(500).json(errorResponse('操作失败', 500));
  }
});

router.get('/:id/comments', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT c.*,
        u.username as user_username, u.email as user_email, u.avatar as user_avatar,
        u.bio as user_bio, u.role as user_role, u.followers_count as user_followers_count,
        u.following_count as user_following_count, u.created_at as user_created_at
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.project_id = ?
      ORDER BY c.created_at DESC
    `;
    const comments = await runQuery(sql, [id]);
    const mappedComments = comments.map(mapComment);
    res.json(successResponse(mappedComments));
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json(errorResponse('获取评论失败', 500));
  }
});

router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json(errorResponse('评论内容不能为空'));
    }

    const commentId = await runInsert(
      'INSERT INTO comments (project_id, user_id, content) VALUES (?, ?, ?)',
      [id, req.user.id, content.trim()]
    );

    await runUpdate('UPDATE projects SET comments_count = comments_count + 1 WHERE id = ?', [id]);

    res.json(successResponse({ id: commentId }, '评论成功'));
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json(errorResponse('评论失败', 500));
  }
});

router.post('/:id/feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const { id } = req.params;
    const { type, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json(errorResponse('反馈内容不能为空'));
    }

    await runInsert(
      'INSERT INTO feedbacks (user_id, project_id, type, content) VALUES (?, ?, ?, ?)',
      [req.user.id, id, type || 'general', content.trim()]
    );

    res.json(successResponse(null, '反馈提交成功，感谢您的建议'));
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json(errorResponse('提交反馈失败', 500));
  }
});

router.post('/:id/collab', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const { id } = req.params;
    const { message } = req.body;

    const existing = await runQuery(
      'SELECT id FROM collaborators WHERE user_id = ? AND project_id = ?',
      [req.user.id, id]
    );

    if (existing.length > 0) {
      return res.status(400).json(errorResponse('您已申请过协作'));
    }

    await runInsert(
      'INSERT INTO collaborators (user_id, project_id, status) VALUES (?, ?, ?)',
      [req.user.id, id, 'pending']
    );

    res.json(successResponse(null, '协作申请已提交，等待作者审核'));
  } catch (err) {
    console.error('Apply collaboration error:', err);
    res.status(500).json(errorResponse('申请失败', 500));
  }
});

export default router;
