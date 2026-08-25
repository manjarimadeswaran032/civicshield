// server/src/models/Role.js
import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: Object.values(ROLES)
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    trim: true
  }],
  isSystemRole: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
export default Role;
