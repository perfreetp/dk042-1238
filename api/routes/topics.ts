import { Router, Response } from 'express';
import { runQuery } from '../db.js';
import { successResponse, errorResponse, mapTopic, mapProject } from '../utils.js';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const topics = await runQuery('SELECT * FROM topics ORDER BY id DESC');
    const mappedTopics = topics.map(mapTopic);
    res.json(successResponse(mappedTopics));
  } catch (err) {
    console.error('Get topics error:', err);
    res.status(500).json(errorResponse('获取专题失败', 500));
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const topics = await runQuery('SELECT * FROM topics WHERE id = ?', [id]);

    if (topics.length === 0) {
      return res.status(404).json(errorResponse('专题不存在', 404));
    }

    const topic = mapTopic(topics[0]);

    if (topic.projectIds.length > 0) {
      const placeholders = topic.projectIds.map(() => '?').join(',');
      const projects = await runQuery(
        `SELECT p.*, 
          c.name as category_name, c.slug as category_slug, c.icon as category_icon,
          u.username as author_username, u.avatar as author_avatar, u.bio as author_bio
         FROM projects p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.id IN (${placeholders}) AND p.status = 'approved'`,
        topic.projectIds
      );
      topic.projects = projects.map((p: any) => mapProject(p));
    }

    res.json(successResponse(topic));
  } catch (err) {
    console.error('Get topic detail error:', err);
    res.status(500).json(errorResponse('获取专题详情失败', 500));
  }
});

export default router;
