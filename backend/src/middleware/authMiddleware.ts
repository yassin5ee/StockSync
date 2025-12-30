import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firstName: string;
        lastName: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.path === '/api/users/login' ||
      req.path === '/api/users/refresh' ||
      req.path === '/api/health'
    ) {
      return next();
    }

    const authHeader = req.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
      }

      const user = await User.findById(decoded.id).lean();
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      req.user = {
        id: user._id?.toString() || '',
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      };

      return next();
    }

    const userId =
      req.query.userId ||
      req.get('X-User-ID') ||
      req.body.userId;
    if (!userId) {
      return next();
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'User not found' });
    }

    req.user = {
      id: user._id?.toString() || '',
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res
      .status(500)
      .json({ success: false, error: 'Authentication failed' });
  }
};

export const getWarehouseFilter = (req: Request) => {
  if (!req.user) {
    return {};
  }

  if (isAdmin(req)) {
    return {};
  }

  return {};
};

export const getTransferFilter = (req: Request) => {
  if (!req.user) {
    return {};
  }

  if (isAdmin(req)) {
    return {};
  }

  return {};
};

export const isAdmin = (req: Request): boolean => {
  if (!req.user) return false;
  return req.user.role === 'admin';
};
