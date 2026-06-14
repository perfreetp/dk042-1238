import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, runInsert } from '../db.js';
import { AuthRequest, authenticateToken, getCurrentUser } from '../middleware/auth.js';
import { successResponse, errorResponse, mapUser } from '../utils.js';
import type { LoginRequest, RegisterRequest } from '../../shared/types/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/register', async (req, res: Response) => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    if (!username || !email || !password) {
      return res.status(400).json(errorResponse('请填写完整信息'));
    }

    const existingUsers = await runQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json(errorResponse('用户名或邮箱已被注册'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    const userId = await runInsert(
      'INSERT INTO users (username, email, password_hash, avatar, bio, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, avatar, '', 'user']
    );

    const token = jwt.sign(
      { id: userId, username, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = await getCurrentUser(userId);

    res.json(successResponse({ token, user }, '注册成功'));
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json(errorResponse('注册失败', 500));
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('请填写邮箱和密码'));
    }

    const users = await runQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json(errorResponse('邮箱或密码错误'));
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json(errorResponse('邮箱或密码错误'));
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const currentUser = await getCurrentUser(user.id);

    res.json(successResponse({ token, user: currentUser }, '登录成功'));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(errorResponse('登录失败', 500));
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('请先登录', 401));
    }

    const user = await getCurrentUser(req.user.id);
    res.json(successResponse(user));
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json(errorResponse('获取用户信息失败', 500));
  }
});

export default router;
