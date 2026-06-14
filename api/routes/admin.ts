import { Router, Response } from 'express';
import { runQuery, runUpdate, runInsert } from '../db.js';
import { AuthRequest, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { successResponse, errorResponse, mapProject, mapTopic } from '../utils.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await runQuery('SELECT COUNT(*) as count FROM users');
    const totalProjects = await runQuery("SELECT COUNT(*) as count FROM projects WHERE status = 'approved'");
    const pendingProjects = await runQuery("SELECT COUNT(*) as count FROM projects WHERE status = 'pending'");
    const totalViews = await runQuery('SELECT SUM(views_count) as sum FROM projects');
    const totalLikes = await runQuery('SELECT SUM(likes_count) as sum FROM projects');

    const today = new Date().toISOString().split('T')[0];
    const todayNewProjects = await runQuery(
      "SELECT COUNT(*) as count FROM projects WHERE DATE(created_at) = ? AND status = 'approved'",
      [today]
    );
    const todayNewUsers = await runQuery(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?',
      [today]
    );

    res.json(successResponse({
      totalUsers: totalUsers[0].count,
      totalProjects: totalProjects[0].count,
      pendingProjects: pendingProjects[0].count,
      totalViews: totalViews[0].sum || 0,
      totalLikes: totalLikes[0].sum || 0,
      todayNewProjects: todayNewProjects[0].count,
      todayNewUsers: todayNewUsers[0].count
    }));
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json(errorResponse('获取统计数据失败', 500));
  }
});

router.get('/projects/pending', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;

    const countSql = "SELECT COUNT(*) as total FROM projects WHERE status = 'pending'";
    const countResult = await runQuery(countSql);
    const total = countResult[0].total;

    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug,
        u.username as author_username, u.avatar as author_avatar, u.email as author_email
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const projects = await runQuery(sql, [pageSizeNum, offset]);
    const mappedProjects = projects.map((p: any) => mapProject(p));

    res.json(successResponse({
      items: mappedProjects,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: offset + pageSizeNum < total
    }));
  } catch (err) {
    console.error('Get pending projects error:', err);
    res.status(500).json(errorResponse('获取待审核项目失败', 500));
  }
});

router.get('/projects/all', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '20', status, search } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const countSql = `SELECT COUNT(*) as total FROM projects p ${whereClause}`;
    const countResult = await runQuery(countSql, params);
    const total = countResult[0].total;

    const sql = `
      SELECT p.*,
        c.name as category_name, c.slug as category_slug,
        u.username as author_username, u.avatar as author_avatar, u.email as author_email
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
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
    console.error('Get all projects error:', err);
    res.status(500).json(errorResponse('获取项目列表失败', 500));
  }
});

router.put('/projects/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await runUpdate("UPDATE projects SET status = 'approved' WHERE id = ?", [id]);
    res.json(successResponse(null, '项目审核通过'));
  } catch (err) {
    console.error('Approve project error:', err);
    res.status(500).json(errorResponse('审核失败', 500));
  }
});

router.put('/projects/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await runUpdate("UPDATE projects SET status = 'rejected' WHERE id = ?", [id]);
    res.json(successResponse(null, '项目已拒绝'));
  } catch (err) {
    console.error('Reject project error:', err);
    res.status(500).json(errorResponse('操作失败', 500));
  }
});

router.put('/projects/:id/mark-broken', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isBroken } = req.body;
    await runUpdate('UPDATE projects SET is_broken = ? WHERE id = ?', [isBroken ? 1 : 0, id]);
    res.json(successResponse(null, isBroken ? '已标记为失效链接' : '已取消失效标记'));
  } catch (err) {
    console.error('Mark broken error:', err);
    res.status(500).json(errorResponse('操作失败', 500));
  }
});

router.put('/projects/:id/feature', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    await runUpdate('UPDATE projects SET is_featured = ? WHERE id = ?', [isFeatured ? 1 : 0, id]);
    res.json(successResponse(null, isFeatured ? '已设为精选' : '已取消精选'));
  } catch (err) {
    console.error('Set featured error:', err);
    res.status(500).json(errorResponse('操作失败', 500));
  }
});

router.get('/topics', async (req: AuthRequest, res: Response) => {
  try {
    const topics = await runQuery('SELECT * FROM topics ORDER BY id DESC');
    const mappedTopics = topics.map(mapTopic);
    res.json(successResponse(mappedTopics));
  } catch (err) {
    console.error('Get admin topics error:', err);
    res.status(500).json(errorResponse('获取专题列表失败', 500));
  }
});

router.post('/topics', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, coverImage, projectIds } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json(errorResponse('专题标题不能为空'));
    }

    const topicId = await runInsert(
      'INSERT INTO topics (title, description, cover_image, project_ids) VALUES (?, ?, ?, ?)',
      [
        title.trim(),
        description || '',
        coverImage || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=featured%20topic%20banner&image_size=landscape_16_9',
        JSON.stringify(projectIds || [])
      ]
    );

    res.json(successResponse({ id: topicId }, '专题创建成功'));
  } catch (err) {
    console.error('Create topic error:', err);
    res.status(500).json(errorResponse('创建专题失败', 500));
  }
});

router.put('/topics/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, coverImage, projectIds } = req.body;

    await runUpdate(
      'UPDATE topics SET title = ?, description = ?, cover_image = ?, project_ids = ? WHERE id = ?',
      [
        title,
        description || '',
        coverImage,
        JSON.stringify(projectIds || []),
        id
      ]
    );

    res.json(successResponse(null, '专题更新成功'));
  } catch (err) {
    console.error('Update topic error:', err);
    res.status(500).json(errorResponse('更新专题失败', 500));
  }
});

router.delete('/topics/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await runUpdate('DELETE FROM topics WHERE id = ?', [id]);
    res.json(successResponse(null, '专题已删除'));
  } catch (err) {
    console.error('Delete topic error:', err);
    res.status(500).json(errorResponse('删除失败', 500));
  }
});

export default router;
