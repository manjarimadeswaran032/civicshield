import Complaint from '../models/Complaint.js';
import ComplaintCategory from '../models/ComplaintCategory.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY, SLA_HOURS, NOTIFICATION_TYPES, AUDIT_ACTIONS, ROLES } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../middleware/auditLogger.js';

const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const nextNumber = (count + 1).toString().padStart(6, '0');
  return `CIV-${currentYear}-${nextNumber}`;
};

export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, address, landmark, city, postalCode, latitude, longitude } = req.body;

    const categoryDoc = await ComplaintCategory.findOne({ name: category, isActive: true }).populate('defaultDepartment');
    
    let assignedDeptId = categoryDoc?.defaultDepartment?._id || null;
    let assignedDeptName = categoryDoc?.defaultDepartment?.name || '';
    let categoryCode = categoryDoc?.code || 'GEN';

    const finalPriority = priority || categoryDoc?.defaultPriority || COMPLAINT_PRIORITY.MEDIUM;
    const slaHours = categoryDoc?.defaultSlaHours || SLA_HOURS[finalPriority] || 72;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const complaintId = await generateComplaintId();
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      citizenName: req.user.name,
      citizenEmail: req.user.email,
      citizenPhone: req.user.phone || '',
      title,
      description,
      category,
      categoryCode,
      imageUrl,
      location: {
        address,
        landmark: landmark || '',
        city: city || 'Metro City',
        postalCode: postalCode || '',
        coordinates: {
          lat: parseFloat(latitude) || 0,
          lng: parseFloat(longitude) || 0
        }
      },
      priority: finalPriority,
      status: COMPLAINT_STATUS.SUBMITTED,
      assignedDepartment: assignedDeptId,
      assignedDepartmentName: assignedDeptName,
      slaHours,
      slaDeadline,
      statusHistory: [{
        previousStatus: 'None',
        newStatus: COMPLAINT_STATUS.SUBMITTED,
        remarks: 'Complaint submitted by citizen via secure portal',
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      }]
    });

    await createNotification({
      userId: req.user._id,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
      title: 'Complaint Registered Successfully',
      message: `Your complaint ${complaint.complaintId} has been logged with priority [${complaint.priority}] and forwarded to ${assignedDeptName || 'Municipal Intake'}. Target resolution within ${slaHours} hours.`,
      link: `/citizen/complaints/${complaint.complaintId}`
    });

    if (assignedDeptId) {
      const managers = await User.find({ role: ROLES.MANAGER, department: assignedDeptId, isActive: true });
      for (const mgr of managers) {
        await createNotification({
          userId: mgr._id,
          complaintId: complaint._id,
          complaintCode: complaint.complaintId,
          type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
          title: 'New Complaint for Department Intake',
          message: `New complaint ${complaint.complaintId} filed under ${complaint.category}. Needs officer assignment.`,
          link: `/officer/complaints/${complaint.complaintId}`
        });
      }
    }

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_CREATE,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { title: complaint.title, category: complaint.category, priority: complaint.priority }
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;
    const query = { citizenId: req.user._id };

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
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

export const getComplaintById = async (req, res, next) => {
  try {
    res.json({
      success: true,
      complaint: req.complaint
    });
  } catch (error) {
    next(error);
  }
};

export const trackPublicComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({ complaintId: complaintId.toUpperCase().trim() });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint tracking ID not found. Please verify the identifier.'
      });
    }

    res.json({
      success: true,
      complaint: {
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        assignedDepartmentName: complaint.assignedDepartmentName,
        createdAt: complaint.createdAt,
        slaDeadline: complaint.slaDeadline,
        isOverdue: complaint.isOverdue,
        resolvedAt: complaint.resolvedAt,
        closedAt: complaint.closedAt,
        location: {
          city: complaint.location.city,
          address: complaint.location.address
        },
        statusHistory: complaint.statusHistory.map(h => ({
          previousStatus: h.previousStatus,
          newStatus: h.newStatus,
          remarks: h.remarks,
          updatedByName: h.updatedByName,
          updatedByRole: h.updatedByRole,
          timestamp: h.timestamp
        })),
        resolutionRemarks: complaint.resolutionRemarks,
        resolutionProofUrl: complaint.resolutionProofUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = req.complaint;

    const allowedReopenStates = [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.AWAITING_CONFIRMATION];
    if (!allowedReopenStates.includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reopen complaint from state '${complaint.status}'. Can only reopen Resolved issues.`
      });
    }

    const previousStatus = complaint.status;
    complaint.status = COMPLAINT_STATUS.REOPENED;
    complaint.reopenReason = reason;
    complaint.reopenedAt = new Date();
    complaint.reopenCount = (complaint.reopenCount || 0) + 1;
    complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;

    complaint.statusHistory.push({
      previousStatus,
      newStatus: COMPLAINT_STATUS.REOPENED,
      remarks: `Citizen reopened complaint: "${reason}"`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    if (complaint.assignedOfficer) {
      await createNotification({
        userId: complaint.assignedOfficer,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        type: NOTIFICATION_TYPES.COMPLAINT_REOPENED,
        title: '⚠️ Complaint Reopened by Citizen',
        message: `Citizen rejected resolution for ${complaint.complaintId}. Reason: "${reason}". Requires reinspection.`,
        link: `/officer/complaints/${complaint.complaintId}`
      });
    }

    if (complaint.assignedDepartment) {
      const managers = await User.find({ role: ROLES.MANAGER, department: complaint.assignedDepartment });
      for (const mgr of managers) {
        await createNotification({
          userId: mgr._id,
          complaintId: complaint._id,
          complaintCode: complaint.complaintId,
          type: NOTIFICATION_TYPES.COMPLAINT_REOPENED,
          title: '⚠️ Reopened Complaint Alert',
          message: `Complaint ${complaint.complaintId} was reopened by citizen. Escalation level: ${complaint.escalationLevel}.`,
          link: `/officer/complaints/${complaint.complaintId}`
        });
      }
    }

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_REOPEN,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { reason, previousStatus }
    });

    res.json({
      success: true,
      message: 'Complaint has been reopened and escalated to municipal personnel',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const confirmResolution = async (req, res, next) => {
  try {
    const { remarks, rating, comment } = req.body;
    const complaint = req.complaint;

    const validStates = [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.AWAITING_CONFIRMATION];
    if (!validStates.includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm resolution for complaint in '${complaint.status}' status.`
      });
    }

    const previousStatus = complaint.status;
    complaint.status = COMPLAINT_STATUS.CLOSED;
    complaint.closedAt = new Date();
    complaint.citizenConfirmation = {
      isConfirmed: true,
      confirmedAt: new Date(),
      confirmationRemarks: remarks || 'Citizen confirmed issue solved successfully'
    };

    if (rating) {
      complaint.feedback = {
        rating: parseInt(rating),
        comment: comment || '',
        submittedAt: new Date()
      };
    }

    complaint.statusHistory.push({
      previousStatus,
      newStatus: COMPLAINT_STATUS.CLOSED,
      remarks: remarks || 'Citizen confirmed issue resolution. Complaint closed.',
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    if (complaint.assignedOfficer) {
      await createNotification({
        userId: complaint.assignedOfficer,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        type: NOTIFICATION_TYPES.RESOLUTION_CONFIRMED,
        title: '🎉 Resolution Confirmed by Citizen',
        message: `Citizen confirmed satisfactory resolution for ${complaint.complaintId}. Rating: ${rating || '5'}/5 stars.`,
        link: `/officer/complaints/${complaint.complaintId}`
      });
    }

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_CONFIRM,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { rating, comment, remarks }
    });

    res.json({
      success: true,
      message: 'Resolution confirmed and complaint successfully closed. Thank you for your feedback!',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const complaint = req.complaint;

    complaint.feedback = {
      rating: parseInt(rating),
      comment: comment || '',
      submittedAt: new Date()
    };

    await complaint.save();

    await logAudit({
      req,
      action: AUDIT_ACTIONS.COMPLAINT_FEEDBACK,
      resource: 'complaints',
      resourceId: complaint.complaintId,
      details: { rating, comment }
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: complaint.feedback
    });
  } catch (error) {
    next(error);
  }
};
