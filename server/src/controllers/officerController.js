import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { COMPLAINT_STATUS, NOTIFICATION_TYPES, AUDIT_ACTIONS, ROLES } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getOfficerComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, department, isOverdue, search, assignedToMe, page = 1, limit = 15 } = req.query;
    const query = {};

    if (req.user.role === ROLES.OFFICER) {
      if (assignedToMe === 'true') {
        query.assignedOfficer = req.user._id;
      } else if (req.user.department) {
        query.assignedDepartment = req.user.department;
      }
    } else if (req.user.role === ROLES.MANAGER) {
      if (req.user.department) {
        query.assignedDepartment = req.user.department;
      }
    }

    if (department && department !== 'all' && (req.user.role === ROLES.ADMIN || !req.user.department)) {
      query.assignedDepartment = department;
    }

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    if (isOverdue === 'true') query.isOverdue = true;

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { citizenName: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      complaints
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    let complaint = id.startsWith('CIV-') ? await Complaint.findOne({ complaintId: id }) : await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found' });
    }

    const previousStatus = complaint.status;
    
    const validTransitions = {
      [COMPLAINT_STATUS.SUBMITTED]: [COMPLAINT_STATUS.UNDER_REVIEW, COMPLAINT_STATUS.ASSIGNED],
      [COMPLAINT_STATUS.UNDER_REVIEW]: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS],
      [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.UNDER_REVIEW],
      [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.UNDER_REVIEW],
      [COMPLAINT_STATUS.REOPENED]: [COMPLAINT_STATUS.UNDER_REVIEW, COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.RESOLVED],
      [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REOPENED],
      [COMPLAINT_STATUS.AWAITING_CONFIRMATION]: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REOPENED],
      [COMPLAINT_STATUS.CLOSED]: []
    };

    if (req.user.role !== ROLES.ADMIN) {
      if (!validTransitions[previousStatus]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid state transition from '${previousStatus}' to '${status}'.`
        });
      }
    }

    complaint.status = status;
    if (remarks) complaint.officerRemarks = remarks;

    complaint.statusHistory.push({
      previousStatus,
      newStatus: status,
      remarks: remarks || `Status updated to ${status}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      type: NOTIFICATION_TYPES.STATUS_UPDATED,
      title: `Status Updated: ${status}`,
      message: `Your complaint ${complaint.complaintId} has been moved to [${status}]. ${remarks ? `Remarks: "${remarks}"` : ''}`,
      link: `/citizen/complaints/${complaint.complaintId}`
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_STATUS_CHANGE,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { previousStatus, newStatus: status, remarks }
    });

    res.json({
      success: true,
      message: `Complaint status successfully updated to ${status}`,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { officerId, departmentId, remarks } = req.body;

    let complaint = id.startsWith('CIV-') ? await Complaint.findOne({ complaintId: id }) : await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found' });
    }

    let assignedOfficer = null;
    if (officerId) {
      assignedOfficer = await User.findById(officerId);
      if (!assignedOfficer) {
        return res.status(400).json({ success: false, message: 'Assigned officer does not exist' });
      }
      complaint.assignedOfficer = assignedOfficer._id;
      complaint.assignedOfficerName = assignedOfficer.name;
      complaint.assignedOfficerEmail = assignedOfficer.email;
    }

    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (dept) {
        complaint.assignedDepartment = dept._id;
        complaint.assignedDepartmentName = dept.name;
      }
    }

    const previousStatus = complaint.status;
    complaint.status = COMPLAINT_STATUS.ASSIGNED;

    complaint.statusHistory.push({
      previousStatus,
      newStatus: COMPLAINT_STATUS.ASSIGNED,
      remarks: remarks || `Assigned to officer ${complaint.assignedOfficerName || 'Staff'} by ${req.user.name}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    if (assignedOfficer) {
      await createNotification({
        userId: assignedOfficer._id,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
        title: 'New Complaint Assigned to You',
        message: `Complaint ${complaint.complaintId} (${complaint.title}) has been assigned to you with [${complaint.priority}] priority. Target SLA: ${complaint.slaHours} hours.`,
        link: `/officer/complaints/${complaint.complaintId}`
      });
    }

    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
      title: 'Officer Assigned to Your Complaint',
      message: `Officer ${complaint.assignedOfficerName} (${complaint.assignedDepartmentName}) has been assigned to investigate your issue.`,
      link: `/citizen/complaints/${complaint.complaintId}`
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_ASSIGN,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { officer: complaint.assignedOfficerName, department: complaint.assignedDepartmentName }
    });

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionRemarks } = req.body;

    let complaint = id.startsWith('CIV-') ? await Complaint.findOne({ complaintId: id }) : await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found' });
    }

    if (!resolutionRemarks || resolutionRemarks.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Resolution remarks detailing corrective action taken are mandatory (minimum 5 characters)'
      });
    }

    let resolutionProofUrl = '';
    if (req.file) {
      resolutionProofUrl = `/uploads/${req.file.filename}`;
    }

    const previousStatus = complaint.status;
    complaint.status = COMPLAINT_STATUS.RESOLVED;
    complaint.resolutionRemarks = resolutionRemarks;
    if (resolutionProofUrl) complaint.resolutionProofUrl = resolutionProofUrl;
    complaint.resolvedAt = new Date();

    complaint.statusHistory.push({
      previousStatus,
      newStatus: COMPLAINT_STATUS.RESOLVED,
      remarks: `Resolved by ${req.user.name}: "${resolutionRemarks}"`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      type: NOTIFICATION_TYPES.COMPLAINT_RESOLVED,
      title: '🎉 Your Civic Complaint Has Been Resolved',
      message: `Complaint ${complaint.complaintId} has been marked as resolved: "${resolutionRemarks}". Please inspect and confirm resolution or reopen if unsatisfied.`,
      link: `/citizen/complaints/${complaint.complaintId}`
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_RESOLVE,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { resolutionRemarks, resolvedBy: req.user.name }
    });

    res.json({
      success: true,
      message: 'Complaint marked as resolved. Citizen has been notified for confirmation.',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const escalateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    let complaint = id.startsWith('CIV-') ? await Complaint.findOne({ complaintId: id }) : await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found' });
    }

    complaint.isOverdue = true;
    complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
    complaint.escalationAlert = reason || `Manual escalation triggered by ${req.user.name}`;

    complaint.statusHistory.push({
      previousStatus: complaint.status,
      newStatus: complaint.status,
      remarks: `Escalated by ${req.user.name}: ${complaint.escalationAlert}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    await logAudit({
      req,
      action: 'COMPLAINT_MANUAL_ESCALATE',
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { reason, escalationLevel: complaint.escalationLevel }
    });

    res.json({
      success: true,
      message: 'Complaint escalated successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};
