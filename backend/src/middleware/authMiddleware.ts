import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include userEmail
declare global {
  namespace Express {
    interface Request {
      userEmail?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { email: string };
    
    if (!decoded.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};
