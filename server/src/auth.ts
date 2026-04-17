import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  [key: string]: any;
}

export function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  return jwt.sign({ userId, email }, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string } {
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  return jwt.verify(token, secret) as { userId: string; email: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
