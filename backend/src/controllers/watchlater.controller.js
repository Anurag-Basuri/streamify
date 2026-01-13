import mongoose from "mongoose";
import { WatchLater } from "../models/watchlater.model.js";
import { Video } from "../models/video.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Helper to populate and map videos for response
const populateAndMapVideos = async (watchLater) => {
    await watchLater.populate({
        path: "videos.video",
        select: "title thumbnail duration views owner createdAt isPublished description",
        populate: { path: "owner", select: "userName fullName avatar" },
    });
    return watchLater.videos.map((v) => ({
        _id: v._id,
        video: v.video,
        addedAt: v.addedAt,
        remindAt: v.remindAt,
    }));
};

/**
 * Add a video to user's watch later list
 * @route POST /api/v1/watchlater/:videoId
 * @access Private
 */
const addVideoToWatchLater = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Validate video ID
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid or missing video ID");
    }

    // Check if video exists and is not deleted
    const video = await Video.findById(videoId).select(
        "_id title isPublished owner"
    );
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    // Check if video is published (optional - depends on your business logic)
    if (!video.isPublished) {
        throw new APIerror(403, "Cannot add unpublished video to watch later");
    }

    // Find or create watch later document
    let watchLater = await WatchLater.findOne({ owner: userId });

    if (!watchLater) {
        // Create new watch later document
        watchLater = await WatchLater.create({
            owner: userId,
            videos: [
                {
                    video: videoId,
                    addedAt: new Date(),
                },
            ],
        });
    } else {
        // Check if video already exists in watch later
        const existingVideo = watchLater.videos.find(
            (v) => v.video.toString() === videoId
        );

        if (existingVideo) {
            throw new APIerror(
                409,
                "Video is already in your watch later list"
            );
        }

        // Check watch later limit (optional)
        const WATCH_LATER_LIMIT = 1000;
        if (watchLater.videos.length >= WATCH_LATER_LIMIT) {
            throw new APIerror(
                400,
                `Watch later list cannot exceed ${WATCH_LATER_LIMIT} videos`
            );
        }

        // Add video to watch later
        watchLater.videos.unshift({
            video: videoId,
            addedAt: new Date(),
        });

        await watchLater.save();
    }

    const videos = await populateAndMapVideos(watchLater);

    return res.status(201).json(
        new APIresponse(
            201,
            {
                videos,
                totalVideos: videos.length,
            },
            "Video successfully added to watch later"
        )
    );
});

/**
 * Remove a video from user's watch later list
 * @route DELETE /api/v1/watchlater/:videoId
 * @access Private
 */
const removeVideoFromWatchLater = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Validate video ID
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid or missing video ID");
    }

    // Find user's watch later document
    const watchLater = await WatchLater.findOne({ owner: userId });
    if (!watchLater) {
        throw new APIerror(404, "Watch later list not found");
    }

    // Find the video to remove
    const videoIndex = watchLater.videos.findIndex(
        (v) => v.video.toString() === videoId
    );

    if (videoIndex === -1) {
        throw new APIerror(404, "Video not found in watch later list");
    }

    // Remove the video
    watchLater.videos.splice(videoIndex, 1);

    await watchLater.save();

    const videos = await populateAndMapVideos(watchLater);

    return res.status(200).json(
        new APIresponse(
            200,
            {
                videos,
                totalVideos: videos.length,
            },
            "Video removed from watch later"
        )
    );
});

/**
 * Get user's watch later videos with pagination and filtering
 * @route GET /api/v1/watchlater
 * @access Private
 */
const getWatchLaterVideos = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const {
        page = 1,
        limit = 20,
        sortBy = "recent",
        filter = "all",
        search = "",
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Find or create watch later document
    let watchLater = await WatchLater.findOne({ owner: userId });
    if (!watchLater) {
        watchLater = await WatchLater.create({
            owner: userId,
            videos: [],
        });
    }

    // Build aggregation pipeline
    let pipeline = [
        { $match: { owner: userId } },
        { $unwind: "$videos" },
        {
            $lookup: {
                from: "videos",
                localField: "videos.video",
                foreignField: "_id",
                as: "videoData",
            },
        },
        { $unwind: "$videoData" },
        {
            $lookup: {
                from: "users",
                localField: "videoData.owner",
                foreignField: "_id",
                as: "ownerData",
            },
        },
        { $unwind: "$ownerData" },
    ];

    // Add search filter if provided
    if (search.trim()) {
        pipeline.push({
            $match: {
                $or: [
                    { "videoData.title": { $regex: search, $options: "i" } },
                    {
                        "videoData.description": {
                            $regex: search,
                            $options: "i",
                        },
                    },
                    { "ownerData.userName": { $regex: search, $options: "i" } },
                ],
            },
        });
    }

    // Add time-based filter
    if (filter !== "all") {
        const now = new Date();
        let dateFilter;

        if (filter === "today") dateFilter = new Date(now.setHours(0, 0, 0, 0));
        else if (filter === "week")
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        else if (filter === "month")
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        if (dateFilter) {
            pipeline.push({
                $match: {
                    "videos.addedAt": { $gte: dateFilter },
                },
            });
        }
    }

    // Add sorting
    const sortOptions = {
        recent: { "videos.addedAt": -1 },
        oldest: { "videos.addedAt": 1 },
        title: { "videoData.title": 1 },
        duration: { "videoData.duration": -1 },
        views: { "videoData.views": -1 },
    };

    pipeline.push({ $sort: sortOptions[sortBy] || sortOptions.recent });

    // Add fields projection
    pipeline.push({
        $project: {
            _id: "$videos._id",
            video: {
                _id: "$videoData._id",
                title: "$videoData.title",
                description: "$videoData.description",
                thumbnail: "$videoData.thumbnail",
                duration: "$videoData.duration",
                views: "$videoData.views",
                createdAt: "$videoData.createdAt",
                isPublished: "$videoData.isPublished",
                owner: {
                    _id: "$ownerData._id",
                    userName: "$ownerData.userName",
                    fullName: "$ownerData.fullName",
                    avatar: "$ownerData.avatar",
                },
            },
            addedAt: "$videos.addedAt",
            remindAt: "$videos.remindAt",
        },
    });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Execute aggregation
    const [videos, countResult] = await Promise.all([
        WatchLater.aggregate(pipeline),
        WatchLater.aggregate(countPipeline),
    ]);

    const totalVideos = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalVideos / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json(
        new APIresponse(
            200,
            {
                videos,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalVideos,
                    hasNextPage,
                    hasPrevPage,
                    videosPerPage: limitNum,
                },
                filters: {
                    sortBy,
                    filter,
                    search,
                },
            },
            "Watch later videos fetched successfully"
        )
    );
});

/**
 * Clear all videos from user's watch later list
 * @route DELETE /api/v1/watchlater/clear
 * @access Private
 */
const clearWatchLater = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const watchLater = await WatchLater.findOne({ owner: userId });
    if (!watchLater) {
        throw new APIerror(404, "Watch later list not found");
    }

    const clearedCount = watchLater.videos.length;
    watchLater.videos = [];
    await watchLater.save();

    return res.status(200).json(
        new APIresponse(
            200,
            {
                videos: [],
                clearedCount,
            },
            `Successfully cleared ${clearedCount} videos from watch later`
        )
    );
});

/**
 * Get watch later statistics
 * @route GET /api/v1/watchlater/stats
 * @access Private
 */
const getWatchLaterStats = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const stats = await WatchLater.aggregate([
        { $match: { owner: userId } },
        { $unwind: "$videos" },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                oldestVideo: { $min: "$videos.addedAt" },
                newestVideo: { $max: "$videos.addedAt" },
                videosThisWeek: {
                    $sum: {
                        $cond: [
                            {
                                $gte: [
                                    "$videos.addedAt",
                                    new Date(
                                        Date.now() - 7 * 24 * 60 * 60 * 1000
                                    ),
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                videosThisMonth: {
                    $sum: {
                        $cond: [
                            {
                                $gte: [
                                    "$videos.addedAt",
                                    new Date(
                                        Date.now() - 30 * 24 * 60 * 60 * 1000
                                    ),
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    const result = stats[0] || {
        totalVideos: 0,
        oldestVideo: null,
        newestVideo: null,
        videosThisWeek: 0,
        videosThisMonth: 0,
    };

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                result,
                "Watch later statistics fetched successfully"
            )
        );
});

/**
 * Update reminder for a video in watch later
 * @route PATCH /api/v1/watchlater/:videoId/reminder
 * @access Private
 */
const updateVideoReminder = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const { remindAt } = req.body;
    const userId = req.user._id;

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid or missing video ID");
    }

    if (remindAt && new Date(remindAt) <= new Date()) {
        throw new APIerror(400, "Reminder time must be in the future");
    }

    const watchLater = await WatchLater.findOne({ owner: userId });
    if (!watchLater) {
        throw new APIerror(404, "Watch later list not found");
    }

    const videoIndex = watchLater.videos.findIndex(
        (v) => v.video.toString() === videoId
    );

    if (videoIndex === -1) {
        throw new APIerror(404, "Video not found in watch later list");
    }

    watchLater.videos[videoIndex].remindAt = remindAt || null;
    await watchLater.save();

    await watchLater.populate({
        path: "videos.video",
        select: "title thumbnail duration views owner createdAt isPublished description",
        populate: { path: "owner", select: "userName fullName avatar" },
    });
    const updatedEntry = watchLater.videos[videoIndex];

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { video: updatedEntry },
                remindAt
                    ? "Reminder set successfully"
                    : "Reminder removed successfully"
            )
        );
});

export {
    addVideoToWatchLater,
    removeVideoFromWatchLater,
    getWatchLaterVideos,
    clearWatchLater,
    getWatchLaterStats,
    updateVideoReminder,
};
