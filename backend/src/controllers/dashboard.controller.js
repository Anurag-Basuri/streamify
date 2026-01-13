import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { WatchLater } from "../models/watchlater.model.js";
import { Subscription } from "../models/subscription.model.js";
import { History } from "../models/history.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Helper to safely count documents
const safeCount = async (model, query) => {
    try {
        return await model.countDocuments(query);
    } catch {
        return 0;
    }
};

// Helper to safely find documents
const safeFind = async (query) => {
    try {
        return await query;
    } catch {
        return [];
    }
};

// Helper to safely find one
const safeFindOne = async (query) => {
    try {
        return await query;
    } catch {
        return null;
    }
};

/**
 * Get comprehensive dashboard data
 */
const getDashboard = asynchandler(async (req, res) => {
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new APIerror(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select(
        "userName fullName email avatar createdAt"
    );
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    try {
        // Calculate date ranges
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Fetch basic counts in parallel (these are simple and safe)
        const [
            videoCount,
            tweetCount,
            commentCount,
            totalVideoLikesGiven,
            totalTweetLikesGiven,
            subscriberCount,
            subscriptionCount,
        ] = await Promise.all([
            safeCount(Video, { owner: userId }),
            safeCount(Tweet, { owner: userId }),
            safeCount(Comment, { owner: userId }),
            safeCount(Like, { likedBy: userId, entityType: "Video" }),
            safeCount(Like, { likedBy: userId, entityType: "Tweet" }),
            safeCount(Subscription, { channel: userId }),
            safeCount(Subscription, { subscriber: userId }),
        ]);

        // Fetch user's videos
        const userVideos = await safeFind(
            Video.find({ owner: userId })
                .select("title thumbnail views duration createdAt")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        );

        // Calculate total views
        const totalViews = userVideos.reduce(
            (sum, v) => sum + (v.views || 0),
            0
        );

        // Get watch later count
        const watchLaterData = await safeFindOne(
            WatchLater.findOne({ owner: userId }).select("videos")
        );
        const watchLaterCount = watchLaterData?.videos?.length || 0;

        // Get history count
        const historyData = await safeFindOne(
            History.findOne({ user: userId }).select("videos")
        );
        const historyCount = historyData?.videos?.length || 0;

        // Get likes received on user's content
        let likesOnUserVideos = 0;
        let likesOnUserTweets = 0;
        let commentsOnUserVideos = 0;

        if (userVideos.length > 0) {
            const videoIds = userVideos.map((v) => v._id);
            likesOnUserVideos = await safeCount(Like, {
                likedEntity: { $in: videoIds },
                entityType: "Video",
            });
            // Note: Comment model uses 'entity' not 'entityId'
            commentsOnUserVideos = await safeCount(Comment, {
                entity: { $in: videoIds },
                entityType: "Video",
            });
        }

        // Get likes on tweets
        const userTweets = await safeFind(
            Tweet.find({ owner: userId }).select("_id").lean()
        );
        if (userTweets.length > 0) {
            const tweetIds = userTweets.map((t) => t._id);
            likesOnUserTweets = await safeCount(Like, {
                likedEntity: { $in: tweetIds },
                entityType: "Tweet",
            });
        }

        // Calculate engagement rate
        const totalEngagement =
            likesOnUserVideos + likesOnUserTweets + commentsOnUserVideos;
        const engagementRate =
            totalViews > 0
                ? parseFloat(((totalEngagement / totalViews) * 100).toFixed(2))
                : 0;

        // Top performing videos (by views)
        const topVideos = [...userVideos]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        // Try to get recent activity (Activity model may not exist yet)
        let recentActivity = [];
        let weekActivityCount = 0;
        try {
            // Dynamic import to check if Activity model exists
            const { Activity } = await import("../models/activity.model.js");
            if (Activity) {
                recentActivity = await Activity.find({ user: userId })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean()
                    .catch(() => []);

                weekActivityCount = await Activity.countDocuments({
                    user: userId,
                    createdAt: { $gte: weekAgo },
                }).catch(() => 0);
            }
        } catch {
            // Activity model doesn't exist yet, use empty data
            recentActivity = [];
            weekActivityCount = 0;
        }

        // Format recent activity with readable messages
        const formattedActivity = recentActivity.map((act) => ({
            _id: act._id,
            type: act.type,
            message: getActivityMessage(act),
            time: act.createdAt,
            metadata: act.metadata || {},
        }));

        // Build dashboard response
        const dashboardData = {
            user: {
                _id: user._id,
                userName: user.userName,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                memberSince: user.createdAt,
            },

            // Primary stats
            stats: {
                totalViews,
                totalVideos: videoCount,
                subscriberCount,
                subscriptionCount,
                totalLikesReceived: likesOnUserVideos + likesOnUserTweets,
                totalCommentsReceived: commentsOnUserVideos,
                engagementRate,
            },

            // Content stats
            content: {
                videos: videoCount,
                tweets: tweetCount,
                comments: commentCount,
                watchLater: watchLaterCount,
                historyCount,
            },

            // Engagement stats
            engagement: {
                likesGiven: totalVideoLikesGiven + totalTweetLikesGiven,
                likesReceived: likesOnUserVideos + likesOnUserTweets,
                commentsReceived: commentsOnUserVideos,
                weeklyActivity: weekActivityCount,
            },

            // Top performing content
            topVideos,

            // Recent activity feed
            recentActivity: formattedActivity,

            // Quick access counts
            quickStats: {
                unreadNotifications: 0,
                pendingWatchLater: watchLaterCount,
                historyItems: historyCount,
            },
        };

        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    dashboardData,
                    "Dashboard fetched successfully"
                )
            );
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw new APIerror(500, "Failed to fetch dashboard data");
    }
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
