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
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    // Parse cookie header manually to extract fitverse_auth
    const raw = req.headers.cookie.split(';').map((c) => c.trim());
    for (const part of raw) {
      if (part.startsWith('fitverse_auth=')) {
        token = part.substring('fitverse_auth='.length);
        break;
      }
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { email: string };

    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};
