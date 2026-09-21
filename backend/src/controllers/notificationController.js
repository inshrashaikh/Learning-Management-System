const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    return successResponse(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, userId: req.user.id });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    notification.isRead = true;
    await notification.save();

    return successResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
