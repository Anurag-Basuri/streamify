import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "like",
                "comment",
                "subscribe",
                "follow",
                "upload",
                "system",
            ],
            index: true,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        link: {
            type: String,
            default: null,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        // Reference to the entity that triggered the notification
        entityType: {
            type: String,
            enum: ["Video", "Comment", "Tweet", "User", null],
            default: null,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "entityType",
            default: null,
        },
        // Additional metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// Add pagination plugin
notificationSchema.plugin(mongoosePaginate);

/**
 * Static method to create a notification
 * @param {Object} params - Notification parameters
 * @returns {Promise<Notification>}
 */
notificationSchema.statics.createNotification = async function ({
    recipient,
    sender,
    type,
    message,
    link = null,
    entityType = null,
    entityId = null,
    metadata = {},
}) {
    // Don't create notification if sender is the same as recipient
    if (recipient.toString() === sender.toString()) {
        return null;
    }

    const notification = await this.create({
        recipient,
        sender,
        type,
        message,
        link,
        entityType,
        entityId,
        metadata,
    });

    return notification.populate("sender", "userName avatar fullName");
};

/**
 * Static method to get unread count for a user
 * @param {ObjectId} userId
 * @returns {Promise<number>}
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ recipient: userId, read: false });
};

/**
 * Static method to mark all notifications as read for a user
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
notificationSchema.statics.markAllAsRead = async function (userId) {
    const result = await this.updateMany(
        { recipient: userId, read: false },
        { read: true }
    );
    return { modifiedCount: result.modifiedCount };
};

export const Notification = mongoose.model("Notification", notificationSchema);
