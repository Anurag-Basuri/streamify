import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { WatchLater } from "../models/watchlater.model.js";
import { Subscription } from "../models/subscription.model.js";
import { History } from "../models/history.model.js";
import { Activity } from "../models/activity.model.js";
import { APIerror } from "../utils/APIerror.js";
import { TtlCache } from "../utils/ttlCache.js";

const dashboardCache = new TtlCache({
    ttlMs: process.env.NODE_ENV === "production" ? 30_000 : 5_000,
    maxEntries: 1000,
});

function objectId(id) {
    return new mongoose.Types.ObjectId(id);
}

async function aggregateVideoStats(userId) {
    const ownerId = objectId(userId);

    const [result] = await Video.aggregate([
        { $match: { owner: ownerId } },
        {
            $facet: {
                totals: [
                    {
                        $group: {
                            _id: null,
                            totalViews: { $sum: { $ifNull: ["$views", 0] } },
                            videoCount: { $sum: 1 },
                        },
                    },
                ],
                topVideos: [
                    { $sort: { views: -1, createdAt: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            views: { $ifNull: ["$views", 0] },
                            duration: { $ifNull: ["$duration", 0] },
                            createdAt: 1,
                        },
                    },
                ],
                likesReceived: [
                    {
                        $lookup: {
                            from: "likes",
                            let: { videoId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$likedEntity",
                                                        "$$videoId",
                                                    ],
                                                },
                                                {
                                                    $eq: [
                                                        "$entityType",
                                                        "Video",
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                { $count: "count" },
                            ],
                            as: "likesAgg",
                        },
                    },
                    {
                        $project: {
                            count: {
                                $ifNull: [
                                    { $arrayElemAt: ["$likesAgg.count", 0] },
                                    0,
                                ],
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$count" } } },
                ],
                commentsReceived: [
                    {
                        $lookup: {
                            from: "comments",
                            let: { videoId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$entity",
                                                        "$$videoId",
                                                    ],
                                                },
                                                {
                                                    $eq: [
                                                        "$entityType",
                                                        "Video",
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                { $count: "count" },
                            ],
                            as: "commentsAgg",
                        },
                    },
                    {
                        $project: {
                            count: {
                                $ifNull: [
                                    {
                                        $arrayElemAt: ["$commentsAgg.count", 0],
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$count" } } },
                ],
            },
        },
    ]);

    const totals = result?.totals?.[0] || { totalViews: 0, videoCount: 0 };
    const likesReceived = result?.likesReceived?.[0]?.total || 0;
    const commentsReceived = result?.commentsReceived?.[0]?.total || 0;

    return {
        totalViews: totals.totalViews || 0,
        videoCount: totals.videoCount || 0,
        topVideos: result?.topVideos || [],
        likesReceived,
        commentsReceived,
    };
}

async function aggregateTweetStats(userId) {
    const ownerId = objectId(userId);

    const [result] = await Tweet.aggregate([
        { $match: { owner: ownerId } },
        {
            $facet: {
                totals: [{ $group: { _id: null, tweetCount: { $sum: 1 } } }],
                likesReceived: [
                    {
                        $lookup: {
                            from: "likes",
                            let: { tweetId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$likedEntity",
                                                        "$$tweetId",
                                                    ],
                                                },
                                                {
                                                    $eq: [
                                                        "$entityType",
                                                        "Tweet",
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                { $count: "count" },
                            ],
                            as: "likesAgg",
                        },
                    },
                    {
                        $project: {
                            count: {
                                $ifNull: [
                                    { $arrayElemAt: ["$likesAgg.count", 0] },
                                    0,
                                ],
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$count" } } },
                ],
                commentsReceived: [
                    {
                        $lookup: {
                            from: "comments",
                            let: { tweetId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$entity",
                                                        "$$tweetId",
                                                    ],
                                                },
                                                {
                                                    $eq: [
                                                        "$entityType",
                                                        "Tweet",
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                { $count: "count" },
                            ],
                            as: "commentsAgg",
                        },
                    },
                    {
                        $project: {
                            count: {
                                $ifNull: [
                                    {
                                        $arrayElemAt: ["$commentsAgg.count", 0],
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$count" } } },
                ],
            },
        },
    ]);

    return {
        tweetCount: result?.totals?.[0]?.tweetCount || 0,
        likesReceived: result?.likesReceived?.[0]?.total || 0,
        commentsReceived: result?.commentsReceived?.[0]?.total || 0,
    };
}

export async function getDashboardData(userId) {
    const cacheKey = `dashboard:${userId}`;
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    if (!mongoose.isValidObjectId(userId)) {
        throw new APIerror(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select(
        "userName fullName email avatar createdAt"
    );

    if (!user) {
        throw new APIerror(404, "User not found");
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
        videoStats,
        tweetStats,
        commentCount,
        likesGiven,
        subscriberCount,
        subscriptionCount,
        watchLaterDoc,
        historyDoc,
        recentActivity,
        weeklyActivity,
    ] = await Promise.all([
        aggregateVideoStats(userId),
        aggregateTweetStats(userId),
        Comment.countDocuments({ owner: userId }).catch(() => 0),
        Like.countDocuments({
            likedBy: userId,
            entityType: { $in: ["Video", "Tweet"] },
        }).catch(() => 0),
        Subscription.countDocuments({ channel: userId }).catch(() => 0),
        Subscription.countDocuments({ subscriber: userId }).catch(() => 0),
        WatchLater.findOne({ owner: userId }).select("videos").lean(),
        History.findOne({ user: userId }).select("videos").lean(),
        Activity.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .catch(() => []),
        Activity.countDocuments({
            user: userId,
            createdAt: { $gte: weekAgo },
        }).catch(() => 0),
    ]);

    const watchLaterCount = watchLaterDoc?.videos?.length || 0;
    const historyCount = historyDoc?.videos?.length || 0;

    const totalLikesReceived =
        (videoStats.likesReceived || 0) + (tweetStats.likesReceived || 0);
    const totalCommentsReceived =
        (videoStats.commentsReceived || 0) + (tweetStats.commentsReceived || 0);

    const totalEngagement = totalLikesReceived + totalCommentsReceived;
    const engagementRate =
        videoStats.totalViews > 0
            ? parseFloat(
                  ((totalEngagement / videoStats.totalViews) * 100).toFixed(2)
              )
            : 0;

    const result = {
        user: {
            _id: user._id,
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            memberSince: user.createdAt,
        },
        stats: {
            totalViews: videoStats.totalViews || 0,
            totalVideos: videoStats.videoCount || 0,
            subscriberCount,
            subscriptionCount,
            totalLikesReceived,
            totalCommentsReceived,
            engagementRate,
        },
        content: {
            videos: videoStats.videoCount || 0,
            tweets: tweetStats.tweetCount || 0,
            comments: commentCount || 0,
            watchLater: watchLaterCount,
            historyCount,
        },
        engagement: {
            likesGiven: likesGiven || 0,
            likesReceived: totalLikesReceived,
            commentsReceived: totalCommentsReceived,
            weeklyActivity: weeklyActivity || 0,
        },
        topVideos: videoStats.topVideos || [],
        recentActivity: recentActivity || [],
        quickStats: {
            unreadNotifications: 0,
            pendingWatchLater: watchLaterCount,
            historyItems: historyCount,
        },
    };

    dashboardCache.set(cacheKey, result);
    return result;
}
