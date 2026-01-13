import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { WatchLater } from "../models/watchlater.model.js";
import { Subscription } from "../models/subscription.model.js";
import { History } from "../models/history.model.js";
import { Activity } from "../models/activity.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

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
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Fetch all data in parallel for performance
        const [
            // Content counts
            videoCount,
            tweetCount,
            commentCount,

            // Engagement counts
            totalVideoLikes,
            totalTweetLikes,
            subscriberCount,
            subscriptionCount,

            // User's videos with view stats
            userVideos,

            // Watch later count
            watchLaterData,

            // History count
            historyData,

            // Recent activity
            recentActivity,

            // This week's activity count
            weekActivityCount,

            // Likes received on user's content
            likesOnUserVideos,
            likesOnUserTweets,

            // Comments on user's videos
            commentsOnUserVideos,
        ] = await Promise.all([
            // Content counts
            Video.countDocuments({ owner: userId }),
            Tweet.countDocuments({ owner: userId }),
            Comment.countDocuments({ owner: userId }),

            // Likes given by user
            Like.countDocuments({ likedBy: userId, entityType: "Video" }),
            Like.countDocuments({ likedBy: userId, entityType: "Tweet" }),

            // Subscribers (people subscribed to this user)
            Subscription.countDocuments({ channel: userId }),

            // Subscriptions (channels this user follows)
            Subscription.countDocuments({ subscriber: userId }),

            // User's videos
            Video.find({ owner: userId })
                .select("title thumbnail views duration createdAt")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            // Watch later
            WatchLater.findOne({ owner: userId }).select("videos"),

            // History
            History.findOne({ user: userId }).select("videos"),

            // Recent activity
            Activity.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            // This week's activity
            Activity.countDocuments({
                user: userId,
                createdAt: { $gte: weekAgo },
            }),

            // Likes received on user's videos
            (async () => {
                const videoIds = await Video.find({ owner: userId }).select(
                    "_id"
                );
                return Like.countDocuments({
                    likedEntity: { $in: videoIds.map((v) => v._id) },
                    entityType: "Video",
                });
            })(),

            // Likes received on user's tweets
            (async () => {
                const tweetIds = await Tweet.find({ owner: userId }).select(
                    "_id"
                );
                return Like.countDocuments({
                    likedEntity: { $in: tweetIds.map((t) => t._id) },
                    entityType: "Tweet",
                });
            })(),

            // Comments on user's videos
            (async () => {
                const videoIds = await Video.find({ owner: userId }).select(
                    "_id"
                );
                return Comment.countDocuments({
                    entityId: { $in: videoIds.map((v) => v._id) },
                    entityType: "Video",
                });
            })(),
        ]);

        // Calculate total views across all videos
        const totalViews = userVideos.reduce(
            (sum, v) => sum + (v.views || 0),
            0
        );

        // Calculate engagement rate
        const totalEngagement =
            likesOnUserVideos + likesOnUserTweets + commentsOnUserVideos;
        const engagementRate =
            totalViews > 0
                ? ((totalEngagement / totalViews) * 100).toFixed(2)
                : 0;

        // Top performing videos (by views)
        const topVideos = [...userVideos]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        // Format recent activity with readable messages
        const formattedActivity = recentActivity.map((act) => ({
            _id: act._id,
            type: act.type,
            message: getActivityMessage(act),
            time: act.createdAt,
            metadata: act.metadata,
        }));

        // Build dashboard response
        const dashboardData = {
            user: {
                ...user.toObject(),
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
                engagementRate: parseFloat(engagementRate),
            },

            // Content stats
            content: {
                videos: videoCount,
                tweets: tweetCount,
                comments: commentCount,
                watchLater: watchLaterData?.videos?.length || 0,
                historyCount: historyData?.videos?.length || 0,
            },

            // Engagement stats
            engagement: {
                likesGiven: totalVideoLikes + totalTweetLikes,
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
                unreadNotifications: 0, // Can be enhanced later
                pendingWatchLater: watchLaterData?.videos?.length || 0,
                historyItems: historyData?.videos?.length || 0,
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
    const userVideos = await Video.find({ owner: userId }).select(
        "_id views createdAt"
    );
    const videoIds = userVideos.map((v) => v._id);

    // Views over time (aggregated by day)
    const viewsByDay = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                avgViews: { $avg: "$views" },
                maxViews: { $max: "$views" },
            },
        },
    ]);

    // Likes trend
    const likesTrend = await Like.aggregate([
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
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

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
    ]);

    // Activity breakdown
    const activityBreakdown = await Activity.aggregate([
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
    ]);

    return res.status(200).json(
        new APIresponse(
            200,
            {
                period: `Last ${days} days`,
                viewStats: viewsByDay[0] || {
                    totalViews: 0,
                    avgViews: 0,
                    maxViews: 0,
                },
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
