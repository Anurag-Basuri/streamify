import mongoose, { Schema } from "mongoose";

/**
 * Activity Model - Tracks user activity for activity feed/log
 * Records various user actions across the platform
 */
const activitySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "video_watch",
                "video_upload",
                "video_like",
                "video_unlike",
                "comment_add",
                "comment_like",
                "tweet_create",
                "tweet_like",
                "tweet_unlike",
                "subscription_add",
                "subscription_remove",
                "playlist_create",
                "playlist_add_video",
                "watchlater_add",
                "profile_update",
                "login",
            ],
            index: true,
        },
        // Reference to the entity involved in the activity
        entityType: {
            type: String,
            enum: ["Video", "Comment", "Tweet", "User", "Playlist", null],
            default: null,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            refPath: "entityType",
            default: null,
        },
        // Additional context data (e.g., video title, comment content preview)
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        // For grouping related activities
        sessionId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

// TTL index to auto-delete old activity logs after 90 days
activitySchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

// Static method to log activity
activitySchema.statics.log = async function (data) {
    try {
        return await this.create(data);
    } catch (error) {
        // Silently fail - activity logging shouldn't break main operations
        console.error("Activity log error:", error.message);
        return null;
    }
};

// Static method to get user's recent activity
activitySchema.statics.getRecentActivity = async function (
    userId,
    options = {}
) {
    const { page = 1, limit = 20, type = null } = options;
    const skip = (page - 1) * limit;

    const query = { user: userId };
    if (type) {
        query.type = type;
    }

    const [activities, total] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("entityId", "title content userName avatar thumbnail")
            .lean(),
        this.countDocuments(query),
    ]);

    return {
        activities,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    };
};

export const Activity = mongoose.model("Activity", activitySchema);
