import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
} from "../controllers/notification.controller.js";

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

// GET /api/v1/notifications - Get all notifications (with pagination)
router.route("/").get(getNotifications);

// GET /api/v1/notifications/unread-count - Get unread count
router.route("/unread-count").get(getUnreadCount);

// PATCH /api/v1/notifications/read-all - Mark all as read
router.route("/read-all").patch(markAllAsRead);

// DELETE /api/v1/notifications/all - Clear all notifications
router.route("/all").delete(clearAllNotifications);

// PATCH /api/v1/notifications/:notificationId/read - Mark single as read
router.route("/:notificationId/read").patch(markAsRead);

// DELETE /api/v1/notifications/:notificationId - Delete single notification
router.route("/:notificationId").delete(deleteNotification);

export default router;
