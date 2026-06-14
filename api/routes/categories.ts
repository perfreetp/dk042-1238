import { Router, Response } from 'express';
import { runQuery } from '../db.js';
import { successResponse, errorResponse, mapCategory } from '../utils.js';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const categories = await runQuery('SELECT * FROM categories ORDER BY id');
    const mappedCategories = categories.map(mapCategory);
    res.json(successResponse(mappedCategories));
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json(errorResponse('获取分类失败', 500));
  }
});

export default router;
