import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { getDashboardData } from "../services/dashboard.service.js";

/**
 * Get comprehensive dashboard data
 */
const getDashboard = asynchandler(async (req, res) => {
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new APIerror(400, "Invalid user ID");
    }

    const dashboardData = await getDashboardData(userId);

    const formattedActivity = (dashboardData.recentActivity || []).map(
        (act) => ({
            _id: act._id,
            type: act.type,
            message: getActivityMessage(act),
            time: act.createdAt,
            metadata: act.metadata || {},
        })
    );

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { ...dashboardData, recentActivity: formattedActivity },
                "Dashboard fetched successfully"
            )
        );
});

/**
 * Get channel analytics (more detailed stats)
 */
const getChannelAnalytics = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user's videos
    const userVideos = await Video.find({ owner: userId })
        .select("_id views createdAt")
        .lean();
    const videoIds = userVideos.map((v) => v._id);

    // View stats
    const totalViews = userVideos.reduce((sum, v) => sum + (v.views || 0), 0);
    const avgViews =
        userVideos.length > 0 ? Math.round(totalViews / userVideos.length) : 0;
    const maxViews =
        userVideos.length > 0
            ? Math.max(...userVideos.map((v) => v.views || 0))
            : 0;

    // Likes trend
    let likesTrend = [];
    if (videoIds.length > 0) {
        likesTrend = await Like.aggregate([
            {
                $match: {
                    likedEntity: { $in: videoIds },
                    entityType: "Video",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]).catch(() => []);
    }

    // Subscriber growth
    const subscriberGrowth = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId),
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
        { $sort: { _id: 1 } },
    ]).catch(() => []);

    // Activity breakdown (if Activity model exists)
    let activityBreakdown = [];
    try {
        const { Activity } = await import("../models/activity.model.js");
        if (Activity) {
            activityBreakdown = await Activity.aggregate([
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
                    },
                },
                { $sort: { count: -1 } },
            ]).catch(() => []);
        }
    } catch {
        activityBreakdown = [];
    }

    return res.status(200).json(
        new APIresponse(
            200,
            {
                period: `Last ${days} days`,
                viewStats: { totalViews, avgViews, maxViews },
                likesTrend,
                subscriberGrowth,
                activityBreakdown,
            },
            "Analytics fetched successfully"
        )
    );
});

/**
 * Helper function to generate activity messages
 */
function getActivityMessage(activity) {
    if (!activity || !activity.type) return "Unknown activity";

    const messages = {
        video_watch: `Watched "${activity.metadata?.title || "a video"}"`,
        video_upload: `Uploaded "${activity.metadata?.title || "a video"}"`,
        video_like: `Liked "${activity.metadata?.title || "a video"}"`,
        video_unlike: `Unliked a video`,
        comment_add: `Commented on a ${activity.entityType?.toLowerCase() || "content"}`,
        comment_like: `Liked a comment`,
        tweet_create: `Created a new post`,
        tweet_like: `Liked a post`,
        tweet_unlike: `Unliked a post`,
        subscription_add: `Subscribed to a channel`,
        subscription_remove: `Unsubscribed from a channel`,
        playlist_create: `Created a new playlist`,
        playlist_add_video: `Added video to playlist`,
        watchlater_add: `Added to Watch Later`,
        profile_update: `Updated profile`,
        login: `Logged in`,
    };

    return messages[activity.type] || `Activity: ${activity.type}`;
}

export { getDashboard, getChannelAnalytics };
