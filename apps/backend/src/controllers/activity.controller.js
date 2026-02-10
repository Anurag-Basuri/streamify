import mongoose from "mongoose";
import { Activity } from "../models/activity.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

/**
 * Get user's activity log with pagination and filtering
 */
const getActivityLog = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const {
        page = 1,
        limit = 20,
        type = null,
        startDate = null,
        endDate = null,
    } = req.query;

    const query = { user: userId };

    // Filter by activity type
    if (type) {
        query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
        Activity.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Activity.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    return res.status(200).json(
        new APIresponse(
            200,
            {
                activities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1,
                },
            },
            "Activity log retrieved successfully"
        )
    );
});

/**
 * Get activity summary/stats for dashboard
 */
const getActivitySummary = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate activity by type
    const summary = await Activity.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
                lastActivity: { $max: "$createdAt" },
            },
        },
        {
            $sort: { count: -1 },
        },
    ]);

    // Activity by day for charts
    const dailyActivity = await Activity.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Total activity count
    const totalCount = await Activity.countDocuments({
        user: userId,
        createdAt: { $gte: startDate },
    });

    return res.status(200).json(
        new APIresponse(
            200,
            {
                summary,
                dailyActivity,
                totalCount,
                period: `Last ${days} days`,
            },
            "Activity summary retrieved successfully"
        )
    );
});

/**
 * Get activity types available
 */
const getActivityTypes = asynchandler(async (req, res) => {
    const types = [
        { type: "video_watch", label: "Video Watched", icon: "play" },
        { type: "video_upload", label: "Video Uploaded", icon: "upload" },
        { type: "video_like", label: "Video Liked", icon: "heart" },
        { type: "comment_add", label: "Comment Added", icon: "message" },
        { type: "comment_like", label: "Comment Liked", icon: "heart" },
        { type: "tweet_create", label: "Post Created", icon: "edit" },
        { type: "tweet_like", label: "Post Liked", icon: "heart" },
        { type: "subscription_add", label: "Subscribed", icon: "user-plus" },
        {
            type: "subscription_remove",
            label: "Unsubscribed",
            icon: "user-minus",
        },
        { type: "playlist_create", label: "Playlist Created", icon: "list" },
        {
            type: "watchlater_add",
            label: "Added to Watch Later",
            icon: "clock",
        },
    ];

    return res
        .status(200)
        .json(
            new APIresponse(200, types, "Activity types retrieved successfully")
        );
});

/**
 * Delete specific activity (for privacy)
 */
const deleteActivity = asynchandler(async (req, res) => {
    const { activityId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(activityId)) {
        throw new APIerror(400, "Invalid activity ID");
    }

    const activity = await Activity.findOneAndDelete({
        _id: activityId,
        user: userId,
    });

    if (!activity) {
        throw new APIerror(404, "Activity not found or not authorized");
    }

    return res
        .status(200)
        .json(new APIresponse(200, null, "Activity deleted successfully"));
});

/**
 * Clear all activity for user
 */
const clearActivityLog = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { type = null } = req.query;

    const query = { user: userId };
    if (type) {
        query.type = type;
    }

    const result = await Activity.deleteMany(query);

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { deletedCount: result.deletedCount },
                "Activity log cleared successfully"
            )
        );
});

export {
    getActivityLog,
    getActivitySummary,
    getActivityTypes,
    deleteActivity,
    clearActivityLog,
};
