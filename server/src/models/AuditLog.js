import mongoose from 'mongoose';
import { AUDIT_RESULTS } from '../config/constants.js';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: { type: String, default: 'Anonymous' },
  userEmail: { type: String, default: 'anonymous@system' },
  role: { type: String, default: 'public' },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: '' },
  result: {
    type: String,
    enum: Object.values(AUDIT_RESULTS),
    default: AUDIT_RESULTS.SUCCESS
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;