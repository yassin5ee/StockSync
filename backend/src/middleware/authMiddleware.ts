import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';

// Add a "user" field to Express Request so TS doesn't complain
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
 * Small middleware that checks if a user is authenticated.
 * If a valid JWT is found, we attach the user info to req.user.
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // These routes must stay open — no login required
    if (
      req.path === '/api/users/login' ||
      req.path === '/api/users/refresh' ||
      req.path === '/api/health'
    ) {
      return next();
    }

    // Try to read the Authorization header (expected format: Bearer token)
    const authHeader = req.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      // Check if the token is valid and not expired
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
      }

      // Make sure the user still exists in the database
      const user = await User.findById(decoded.id).lean();
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      // Put user data on the request so the routes know who's calling
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

    // If no JWT was sent, we fall back to the old system (if used)
    const userId =
      req.query.userId ||
      req.get('X-User-ID') ||
      req.body.userId;
    // If there's no authentication info at all, just continue
    // (useful for public endpoints)
    if (!userId) {
      return next();
    }

    // Load the user from the database using the fallback ID
    const user = await User.findById(userId).lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'User not found' });
    }

    // Attach the user to req, same as the JWT case
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
   * Build a MongoDB filter for warehouse queries depending on the user's role.
   * Right now admins and non-admins see everything, but this can be expanded later.
   */
export const getWarehouseFilter = (req: Request) => {
  if (!req.user) {
    // admin → no restrictions
    return {};
  }

  // other roles → currently unrestricted
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
 * Utility to quickly check if the current user is admin.
 */
export const isAdmin = (req: Request): boolean => {
  if (!req.user) return false;
  return req.user.role === 'admin';
};
