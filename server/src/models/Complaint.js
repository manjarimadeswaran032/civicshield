import mongoose from 'mongoose';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../config/constants.js';

const statusHistorySchema = new mongoose.Schema({
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  remarks: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String, default: 'System' },
  updatedByRole: { type: String, default: 'system' },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  citizenName: { type: String, required: true },
  citizenEmail: { type: String, required: true },
  citizenPhone: { type: String, default: '' },
  
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  categoryCode: { type: String, default: 'GEN' },
  imageUrl: { type: String, default: '' },
  
  location: {
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, default: 'Metro City' },
    postalCode: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  
  priority: {
    type: String,
    enum: Object.values(COMPLAINT_PRIORITY),
    default: COMPLAINT_PRIORITY.MEDIUM,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(COMPLAINT_STATUS),
    default: COMPLAINT_STATUS.SUBMITTED,
    index: true
  },
  
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  assignedDepartmentName: { type: String, default: '' },
  
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedOfficerName: { type: String, default: '' },
  assignedOfficerEmail: { type: String, default: '' },
  
  slaHours: { type: Number, default: 72 },
  slaDeadline: { type: Date, required: true },
  isOverdue: { type: Boolean, default: false, index: true },
  escalationLevel: { type: Number, default: 0 },
  escalationAlert: { type: String, default: '' },
  
  officerRemarks: { type: String, default: '' },
  resolutionRemarks: { type: String, default: '' },
  resolutionProofUrl: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null },
  
  reopenReason: { type: String, default: '' },
  reopenedAt: { type: Date, default: null },
  reopenCount: { type: Number, default: 0 },
  
  citizenConfirmation: {
    isConfirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date, default: null },
    confirmationRemarks: { type: String, default: '' }
  },
  
  feedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, default: '' },
    submittedAt: { type: Date, default: null }
  },
  
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;