import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { runQuery } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌', data: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ code: 403, message: '认证令牌无效或已过期', data: null });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ code: 401, message: '请先登录', data: null });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限', data: null });
  }

  next();
}

export async function getCurrentUser(userId: number) {
  const users = await runQuery(
    'SELECT id, username, email, avatar, bio, role, followers_count, following_count, created_at FROM users WHERE id = ?',
    [userId]
  );
  
  if (users.length === 0) return null;
  
  const user = users[0];
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    followersCount: user.followers_count,
    followingCount: user.following_count,
    createdAt: user.created_at
  };
}
