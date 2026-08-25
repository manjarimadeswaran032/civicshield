// server/src/models/Permission.js
import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    enum: ['complaints', 'users', 'roles', 'departments', 'categories', 'audit_logs', 'analytics', 'settings']
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'assign', 'resolve', 'reopen', 'manage']
  }
}, {
  timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
