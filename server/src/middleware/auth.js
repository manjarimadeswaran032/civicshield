import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SecurityEvent from '../models/SecurityEvent.js';
import { SECURITY_EVENT_TYPES } from '../config/constants.js';

export const authenticateUser = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Authentication token required'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'civicshield_super_secure_jwt_secret_key_2026_production_grade';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User record no longer exists'
      });
    }

    if (!user.isActive) {
      await SecurityEvent.create({
        eventType: SECURITY_EVENT_TYPES.UNAUTHORIZED_ACCESS,
        severity: 'HIGH',
        description: 'Inactive user attempted access',
        email: user.email,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        path: req.originalUrl,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact municipal administration.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};
