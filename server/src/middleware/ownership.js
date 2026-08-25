import Complaint from '../models/Complaint.js';
import { ROLES } from '../config/constants.js';

export const verifyComplaintOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    let complaint;

    if (id.startsWith('CIV-')) {
      complaint = await Complaint.findOne({ complaintId: id });
    } else {
      complaint = await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found'
      });
    }

    req.complaint = complaint;

    // Admins have universal access
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Officers and Managers have access to authorized department/complaints
    if (req.user.role === ROLES.OFFICER || req.user.role === ROLES.MANAGER) {
      return next();
    }

    // Citizens can ONLY view/modify their own complaints
    if (req.user.role === ROLES.CITIZEN) {
      if (complaint.citizenId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view or modify this complaint'
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying resource authorization: ' + error.message
    });
  }
};
