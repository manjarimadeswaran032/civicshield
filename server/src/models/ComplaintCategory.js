// server/src/models/ComplaintCategory.js
import mongoose from 'mongoose';
import { COMPLAINT_PRIORITY } from '../config/constants.js';

const complaintCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'AlertCircle'
  },
  defaultDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  defaultPriority: {
    type: String,
    enum: Object.values(COMPLAINT_PRIORITY),
    default: COMPLAINT_PRIORITY.MEDIUM
  },
  defaultSlaHours: {
    type: Number,
    required: true,
    default: 72
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ComplaintCategory = mongoose.model('ComplaintCategory', complaintCategorySchema);
export default ComplaintCategory;
