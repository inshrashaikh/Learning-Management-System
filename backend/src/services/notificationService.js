const Notification = require('../models/Notification');

/**
 * Helper to dispatch notification to user
 */
const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      link
    });
  } catch (error) {
    console.error('[Notification Error]', error.message);
  }
};

module.exports = {
  createNotification
};
