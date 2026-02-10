import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

/**
 * Get all notifications for the authenticated user
 * Supports pagination and filtering by type/read status
 */
const getNotifications = asynchandler(async (req, res) => {
    const { page = 1, limit = 20, type, read } = req.query;

    const query = { recipient: req.user._id };

    // Filter by type if provided
    if (
        type &&
        ["like", "comment", "subscribe", "upload", "system"].includes(type)
    ) {
        query.type = type;
    }

    // Filter by read status if provided
    if (read !== undefined) {
        query.read = read === "true";
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "sender",
            select: "userName avatar fullName",
        },
    };

    const notifications = await Notification.paginate(query, options);

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    return res.status(200).json(
        new APIresponse(
            200,
            {
                docs: notifications.docs,
                totalDocs: notifications.totalDocs,
                page: notifications.page,
                totalPages: notifications.totalPages,
                hasNextPage: notifications.hasNextPage,
                hasPrevPage: notifications.hasPrevPage,
                unreadCount,
            },
            "Notifications fetched successfully"
        )
    );
});

/**
 * Mark a single notification as read
 */
const markAsRead = asynchandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
        throw new APIerror(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { read: true },
        { new: true }
    ).populate("sender", "userName avatar fullName");

    if (!notification) {
        throw new APIerror(404, "Notification not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, notification, "Notification marked as read")
        );
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = asynchandler(async (req, res) => {
    const result = await Notification.markAllAsRead(req.user._id);

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { modifiedCount: result.modifiedCount },
                "All notifications marked as read"
            )
        );
});

/**
 * Delete a single notification
 */
const deleteNotification = asynchandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
        throw new APIerror(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: req.user._id,
    });

    if (!notification) {
        throw new APIerror(404, "Notification not found");
    }

    return res
        .status(200)
        .json(new APIresponse(200, null, "Notification deleted successfully"));
});

/**
 * Clear all notifications for the user
 */
const clearAllNotifications = asynchandler(async (req, res) => {
    const result = await Notification.deleteMany({ recipient: req.user._id });

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { deletedCount: result.deletedCount },
                "All notifications cleared"
            )
        );
});

/**
 * Get unread notification count
 */
const getUnreadCount = asynchandler(async (req, res) => {
    const count = await Notification.getUnreadCount(req.user._id);

    return res
        .status(200)
        .json(new APIresponse(200, { count }, "Unread count fetched"));
});

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
};
