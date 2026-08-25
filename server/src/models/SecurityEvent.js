import mongoose from 'mongoose';
import { SECURITY_EVENT_TYPES } from '../config/constants.js';

const securityEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: Object.values(SECURITY_EVENT_TYPES),
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  description: { type: String, required: true },
  email: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: '' },
  path: { type: String, default: '' },
  method: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);
export default SecurityEvent;