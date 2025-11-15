import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';

// Extend Express Request type to include user
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

/**
 * Authentication middleware to extract user from JWT token
 * Expects JWT token in Authorization header: Bearer <token>
 * Falls back to legacy userId for backward compatibility
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip auth middleware for login, refresh, and health check endpoints
    if (
      req.path === '/api/users/login' ||
      req.path === '/api/users/refresh' ||
      req.path === '/api/health'
    ) {
      return next();
    }

    // Try to extract JWT token from Authorization header
    const authHeader = req.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      // Verify JWT token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
      }

      // Fetch user from database to ensure they still exist
      const user = await User.findById(decoded.id).lean();
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      // Attach user to request
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

    // Fallback to legacy userId-based auth (for backward compatibility)
    const userId =
      req.query.userId ||
      req.get('X-User-ID') ||
      req.body.userId;

    if (!userId) {
      // If no authentication provided, continue without user context
      // (useful for public endpoints)
      return next();
    }

    // Fetch user from database
    const user = await User.findById(userId).lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'User not found' });
    }

    // Attach user to request
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

/**
 * Helper function to build warehouse filter
 * - Admin can see all warehouses
 * - Other roles may have specific warehouse access (to be implemented if needed)
 */
export const getWarehouseFilter = (req: Request) => {
  if (!req.user) {
    // No user context - no filter
    return {};
  }

  // Admin can see all warehouses
  if (isAdmin(req)) {
    return {};
  }

  // For now, all authenticated users can see all warehouses
  // This can be customized based on role requirements
  return {};
};

/**
 * Helper function to filter transfers by user's warehouses
 */
export const getTransferFilter = (req: Request) => {
  if (!req.user) {
    return {};
  }

  // Admin can see all transfers
  if (isAdmin(req)) {
    return {};
  }

  // For now, all authenticated users can see all transfers
  // This can be customized based on role requirements
  return {};
};

/**
 * Check if user has admin role
 */
export const isAdmin = (req: Request): boolean => {
  if (!req.user) return false;
  return req.user.role === 'admin';
};
