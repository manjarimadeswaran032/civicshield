import SecurityEvent from '../models/SecurityEvent.js';
import { SECURITY_EVENT_TYPES } from '../config/constants.js';

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      try {
        await SecurityEvent.create({
          eventType: SECURITY_EVENT_TYPES.PERMISSION_DENIED,
          severity: 'HIGH',
         description: 'Access forbidden: User attempted to access a restricted resource',
          email: req.user.email,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'] || '',
          path: req.originalUrl,
          method: req.method,
          metadata: { userRole: req.user.role, requiredRoles: allowedRoles }
        });
      } catch (err) {
        console.error('Failed to log security event:', err.message);
      }

      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this role'
      });
    }

    next();
  };
};
