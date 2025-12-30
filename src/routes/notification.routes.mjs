import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification
} from "../controllers/notification.controller.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

// Get user notifications
router.get("/", isAuthenticated, getUserNotifications);

// Get unread count
router.get("/unread-count", isAuthenticated, getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", isAuthenticated, markNotificationAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", isAuthenticated, markAllNotificationsAsRead);

// Delete notification
router.delete("/:notificationId", isAuthenticated, deleteNotification);

export default router;