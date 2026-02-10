/**
 * Notification Helper
 * Utility functions for creating notifications and emitting real-time events
 */
import { Notification } from "../models/notification.model.js";

// Socket.io instance reference (set by index.js)
let io = null;

/**
 * Set the Socket.io instance
 * @param {Server} socketIO - Socket.io server instance
 */
export const setSocketIO = (socketIO) => {
    io = socketIO;
};

/**
 * Get the Socket.io instance
 * @returns {Server|null}
 */
export const getSocketIO = () => io;

/**
 * Emit notification to a specific user via Socket.io
 * @param {string} userId - Recipient user ID
 * @param {Object} notification - Notification object
 */
const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit("notification:new", notification);
    }
};

/**
 * Create a notification for video like
 * @param {Object} params - { videoOwner, liker, video }
 */
export const notifyVideoLike = async ({ videoOwner, liker, video }) => {
    try {
        const notification = await Notification.createNotification({
            recipient: videoOwner._id || videoOwner,
            sender: liker._id || liker,
            type: "like",
            message: `${liker.userName || liker.fullName} liked your video "${video.title}"`,
            link: `/watch/${video._id}`,
            entityType: "Video",
            entityId: video._id,
            metadata: {
                videoTitle: video.title,
                videoThumbnail: video.thumbnail,
            },
        });

        if (notification) {
            emitNotification(notification.recipient.toString(), notification);
        }

        return notification;
    } catch (error) {
        console.error("Error creating video like notification:", error.message);
        return null;
    }
};

/**
 * Create a notification for new comment
 * @param {Object} params - { contentOwner, commenter, content, contentType, comment }
 */
export const notifyNewComment = async ({
    contentOwner,
    commenter,
    content,
    contentType,
    comment,
}) => {
    try {
        const typeLabel = contentType === "Video" ? "video" : "tweet";
        const title =
            content.title || content.content?.substring(0, 50) || "content";

        const notification = await Notification.createNotification({
            recipient: contentOwner._id || contentOwner,
            sender: commenter._id || commenter,
            type: "comment",
            message: `${commenter.userName || commenter.fullName} commented on your ${typeLabel}: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? "..." : ""}"`,
            link:
                contentType === "Video"
                    ? `/watch/${content._id}`
                    : `/tweets/${content._id}`,
            entityType: "Comment",
            entityId: comment._id,
            metadata: {
                contentTitle: title,
                commentContent: comment.content.substring(0, 100),
            },
        });

        if (notification) {
            emitNotification(notification.recipient.toString(), notification);
        }

        return notification;
    } catch (error) {
        console.error("Error creating comment notification:", error.message);
        return null;
    }
};

/**
 * Create a notification for new subscription
 * @param {Object} params - { channel, subscriber }
 */
export const notifyNewSubscription = async ({ channel, subscriber }) => {
    try {
        const notification = await Notification.createNotification({
            recipient: channel._id || channel,
            sender: subscriber._id || subscriber,
            type: "subscribe",
            message: `${subscriber.userName || subscriber.fullName} subscribed to your channel`,
            link: `/channel/${subscriber.userName}`,
            entityType: "User",
            entityId: subscriber._id || subscriber,
            metadata: { subscriberAvatar: subscriber.avatar },
        });

        if (notification) {
            emitNotification(notification.recipient.toString(), notification);
        }

        return notification;
    } catch (error) {
        console.error(
            "Error creating subscription notification:",
            error.message
        );
        return null;
    }
};

/**
 * Create notifications for new video upload (notify all subscribers)
 * @param {Object} params - { uploader, video, subscribers }
 */
export const notifyNewVideo = async ({ uploader, video, subscribers }) => {
    try {
        const notifications = [];

        for (const subscriberId of subscribers) {
            const notification = await Notification.createNotification({
                recipient: subscriberId,
                sender: uploader._id || uploader,
                type: "upload",
                message: `${uploader.userName || uploader.fullName} uploaded a new video: "${video.title}"`,
                link: `/watch/${video._id}`,
                entityType: "Video",
                entityId: video._id,
                metadata: {
                    videoTitle: video.title,
                    videoThumbnail: video.thumbnail,
                },
            });

            if (notification) {
                notifications.push(notification);
                emitNotification(subscriberId.toString(), notification);
            }
        }

        return notifications;
    } catch (error) {
        console.error(
            "Error creating video upload notifications:",
            error.message
        );
        return [];
    }
};

/**
 * Create a system notification
 * @param {Object} params - { recipient, message, link }
 */
export const notifySystem = async ({ recipient, message, link = null }) => {
    try {
        // For system notifications, sender can be the recipient or a system user
        const notification = await Notification.create({
            recipient: recipient._id || recipient,
            sender: recipient._id || recipient,
            type: "system",
            message,
            link,
        });

        const populated = await notification.populate(
            "sender",
            "userName avatar fullName"
        );

        emitNotification((recipient._id || recipient).toString(), populated);

        return populated;
    } catch (error) {
        console.error("Error creating system notification:", error.message);
        return null;
    }
};

export default {
    setSocketIO,
    getSocketIO,
    notifyVideoLike,
    notifyNewComment,
    notifyNewSubscription,
    notifyNewVideo,
    notifySystem,
};
