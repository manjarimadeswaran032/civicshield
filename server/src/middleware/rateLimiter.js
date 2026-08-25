import rateLimit from 'express-rate-limit';
import SecurityEvent from '../models/SecurityEvent.js';
import { SECURITY_EVENT_TYPES } from '../config/constants.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    try {
      await SecurityEvent.create({
        eventType: SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED,
        severity: 'MEDIUM',
        description: `Rate limit exceeded on auth endpoint`,
        email: req.body?.email || '',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        path: req.originalUrl,
        method: req.method
      });
    } catch (e) {
      console.error('Rate limit log error:', e.message);
    }

    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
    });
  }
});

export const publicTrackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many tracking requests. Please wait a moment.'
  }
});
