import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { COMPLAINT_STATUS, NOTIFICATION_TYPES, ROLES } from '../config/constants.js';
import { createNotification } from './notificationService.js';
import { logAudit } from '../middleware/auditLogger.js';

export const checkOverdueComplaints = async () => {
  try {
    const now = new Date();
    const activeStatuses = [
      COMPLAINT_STATUS.SUBMITTED,
      COMPLAINT_STATUS.UNDER_REVIEW,
      COMPLAINT_STATUS.ASSIGNED,
      COMPLAINT_STATUS.IN_PROGRESS,
      COMPLAINT_STATUS.REOPENED
    ];

    const overdueComplaints = await Complaint.find({
      status: { $in: activeStatuses },
      slaDeadline: { $lt: now },
      isOverdue: false
    });

    for (const complaint of overdueComplaints) {
      complaint.isOverdue = true;
      complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
      complaint.escalationAlert = `SLA Breached: Complaint ${complaint.complaintId} has exceeded its resolution SLA deadline of ${complaint.slaHours} hours.`;
      
      await complaint.save();

      // Notify citizen
      await createNotification({
        userId: complaint.citizenId,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        type: NOTIFICATION_TYPES.SLA_OVERDUE,
        title: 'Resolution Delayed (SLA Escalated)',
        message: `Your complaint ${complaint.complaintId} has exceeded standard SLA and has been automatically escalated to department supervision for priority intervention.`,
        link: `/citizen/complaints/${complaint.complaintId}`
      });

      // Notify assigned officer if assigned
      if (complaint.assignedOfficer) {
        await createNotification({
          userId: complaint.assignedOfficer,
          complaintId: complaint._id,
          complaintCode: complaint.complaintId,
          type: NOTIFICATION_TYPES.SLA_OVERDUE,
          title: '🚨 SLA Breach Escalation Warning',
          message: `Complaint ${complaint.complaintId} assigned to you has exceeded SLA deadline (${complaint.priority} Priority). Immediate resolution required.`,
          link: `/officer/complaints/${complaint.complaintId}`
        });
      }

      // Notify department managers
      if (complaint.assignedDepartment) {
        const managers = await User.find({
          role: ROLES.MANAGER,
          department: complaint.assignedDepartment,
          isActive: true
        });

        for (const manager of managers) {
          await createNotification({
            userId: manager._id,
            complaintId: complaint._id,
            complaintCode: complaint.complaintId,
            type: NOTIFICATION_TYPES.COMPLAINT_ESCALATED,
            title: '🚨 Department SLA Violation Alert',
            message: `Complaint ${complaint.complaintId} (${complaint.title}) in your department is OVERDUE. Escalation level: ${complaint.escalationLevel}.`,
            link: `/officer/complaints/${complaint.complaintId}`
          });
        }
      }

      await logAudit({
        action: 'SLA_BREACH_ESCALATED',
        resource: 'complaints',
        resourceId: complaint.complaintId,
        details: {
          priority: complaint.priority,
          slaHours: complaint.slaHours,
          deadline: complaint.slaDeadline,
          escalationLevel: complaint.escalationLevel
        }
      });
    }

    if (overdueComplaints.length > 0) {
      console.log(`[SLA ENGINE] Evaluated ${overdueComplaints.length} overdue complaint(s) and triggered escalations.`);
    }
  } catch (error) {
    console.error('[SLA ENGINE ERROR]', error.message);
  }
};
