import NotificationService from "../services/notification.service.mjs";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await NotificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await NotificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    await NotificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message
    });
  }
};