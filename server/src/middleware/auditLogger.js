import AuditLog from '../models/AuditLog.js';
import { AUDIT_RESULTS } from '../config/constants.js';

export const logAudit = async ({
  req,
  action,
  resource,
  resourceId = '',
  details = {},
  result = AUDIT_RESULTS.SUCCESS,
  userId = null,
  userName = 'System',
  userEmail = 'system@civicshield.gov',
  role = 'system'
}) => {
  try {
    const user = req?.user;
    const ip = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
    const ua = req?.headers ? req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      userId: user ? user._id : userId,
      userName: user ? user.name : userName,
      userEmail: user ? user.email : userEmail,
      role: user ? user.role : role,
      action,
      resource,
      resourceId: resourceId.toString(),
      details,
      ipAddress: ip,
      userAgent: ua,
      result
    });
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error.message);
  }
};
