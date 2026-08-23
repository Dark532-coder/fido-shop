import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fido-shop-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'client' | 'admin';
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: requires a valid JWT token in the Authorization header.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token d\'authentification manquant.' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.user.userId) as { id: string; role: 'client' | 'admin' } | undefined;
    if (!user || user.role !== req.user.role) {
      res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

/**
 * Middleware: requires admin role after auth.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    return;
  }
  next();
}
