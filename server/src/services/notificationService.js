import Notification from '../models/Notification.js';

export const createNotification = async ({
  userId,
  complaintId = null,
  complaintCode = '',
  type,
  title,
  message,
  link = ''
}) => {
  try {
    const notification = await Notification.create({
      userId,
      complaintId,
      complaintCode,
      type,
      title,
      message,
      link
    });
    return notification;
  } catch (error) {
    console.error('[NOTIFICATION DISPATCH ERROR]', error.message);
    return null;
  }
};
