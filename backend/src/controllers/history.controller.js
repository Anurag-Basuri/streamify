import mongoose from "mongoose";
import { History } from "../models/history.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Activity } from "../models/activity.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

/**
 * Add video to history
 */
const addVideoToHistory = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    // Check if the video exists
    const video = await Video.findById(videoId).select("title thumbnail");
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    // Find or create history for the user
    let history = await History.findOne({ user: userId });
    if (!history) {
        history = new History({ user: userId, videos: [] });
    }

    // Remove the video if it already exists in history (to move it to top)
    history.videos = history.videos.filter(
        (item) => item.video.toString() !== videoId
    );

    // Add the video to the beginning with current timestamp
    history.videos.unshift({
        video: videoId,
        watchedAt: new Date(),
    });

    // Limit history to last 200 videos
    if (history.videos.length > 200) {
        history.videos = history.videos.slice(0, 200);
    }

    await history.save();

    // Log activity (non-blocking)
    Activity.log({
        user: userId,
        type: "video_watch",
        entityType: "Video",
        entityId: videoId,
        metadata: {
            title: video.title,
            thumbnail: video.thumbnail,
        },
    }).catch(() => {});

    res.status(200).json(
        new APIresponse(200, { added: true }, "Video added to history")
    );
});

/**
 * Get user's history with pagination
 */
const getUserHistory = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20, search = "" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const history = await History.findOne({ user: userId });

    if (!history || history.videos.length === 0) {
        return res.status(200).json(
            new APIresponse(
                200,
                {
                    videos: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalItems: 0,
                        hasNext: false,
                        hasPrev: false,
                    },
                },
                "No history found"
            )
        );
    }

    // Get all video IDs from history
    const videoIds = history.videos.map((item) => item.video);
    const watchedAtMap = new Map(
        history.videos.map((item) => [item.video.toString(), item.watchedAt])
    );

    // Build query for videos
    const videoQuery = {
        _id: { $in: videoIds },
    };

    // Add search filter if provided
    if (search) {
        videoQuery.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    // Get filtered video IDs
    const matchingVideos = await Video.find(videoQuery).select("_id").lean();

    const matchingVideoIds = new Set(
        matchingVideos.map((v) => v._id.toString())
    );

    // Filter and maintain order from history
    const filteredVideoIds = history.videos
        .filter((item) => matchingVideoIds.has(item.video.toString()))
        .map((item) => item.video);

    const totalItems = filteredVideoIds.length;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Paginate
    const paginatedVideoIds = filteredVideoIds.slice(
        (pageNum - 1) * limitNum,
        pageNum * limitNum
    );

    // Fetch full video details for paginated results
    const videos = await Video.find({ _id: { $in: paginatedVideoIds } })
        .select("title thumbnail duration views owner createdAt")
        .populate("owner", "userName avatar fullName")
        .lean();

    // Sort videos to match history order and add watchedAt
    const videoMap = new Map(videos.map((v) => [v._id.toString(), v]));
    const orderedVideos = paginatedVideoIds
        .map((id) => {
            const video = videoMap.get(id.toString());
            if (video) {
                return {
                    ...video,
                    watchedAt: watchedAtMap.get(id.toString()),
                };
            }
            return null;
        })
        .filter(Boolean);

    res.status(200).json(
        new APIresponse(
            200,
            {
                videos: orderedVideos,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1,
                },
            },
            "History retrieved successfully"
        )
    );
});

/**
 * Remove video from history
 */
const removeVideoFromHistory = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const history = await History.findOne({ user: userId });
    if (!history) {
        throw new APIerror(404, "History not found");
    }

    const initialLength = history.videos.length;
    history.videos = history.videos.filter(
        (item) => item.video.toString() !== videoId
    );

    if (history.videos.length === initialLength) {
        throw new APIerror(404, "Video not found in history");
    }

    await history.save();

    res.status(200).json(
        new APIresponse(200, { removed: true }, "Video removed from history")
    );
});

/**
 * Remove multiple videos from history
 */
const removeMultipleFromHistory = asynchandler(async (req, res) => {
    const { videoIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
        throw new APIerror(400, "Video IDs array is required");
    }

    const history = await History.findOne({ user: userId });
    if (!history) {
        throw new APIerror(404, "History not found");
    }

    const videoIdSet = new Set(videoIds.map((id) => id.toString()));
    const initialLength = history.videos.length;

    history.videos = history.videos.filter(
        (item) => !videoIdSet.has(item.video.toString())
    );

    const removedCount = initialLength - history.videos.length;
    await history.save();

    res.status(200).json(
        new APIresponse(
            200,
            { removedCount },
            `${removedCount} videos removed from history`
        )
    );
});

/**
 * Clear user's history
 */
const clearUserHistory = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const history = await History.findOne({ user: userId });
    if (!history) {
        return res
            .status(200)
            .json(
                new APIresponse(200, { cleared: true }, "History already empty")
            );
    }

    const clearedCount = history.videos.length;
    history.videos = [];
    await history.save();

    res.status(200).json(
        new APIresponse(
            200,
            { cleared: true, clearedCount },
            "History cleared successfully"
        )
    );
});

/**
 * Get history statistics
 */
const getHistoryStats = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const history = await History.findOne({ user: userId });

    if (!history || history.videos.length === 0) {
        return res.status(200).json(
            new APIresponse(
                200,
                {
                    totalVideos: 0,
                    todayCount: 0,
                    weekCount: 0,
                    monthCount: 0,
                },
                "No history stats"
            )
        );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
        totalVideos: history.videos.length,
        todayCount: history.videos.filter((v) => new Date(v.watchedAt) >= today)
            .length,
        weekCount: history.videos.filter(
            (v) => new Date(v.watchedAt) >= weekAgo
        ).length,
        monthCount: history.videos.filter(
            (v) => new Date(v.watchedAt) >= monthAgo
        ).length,
        oldestWatch: history.videos[history.videos.length - 1]?.watchedAt,
        newestWatch: history.videos[0]?.watchedAt,
    };

    res.status(200).json(
        new APIresponse(200, stats, "History stats retrieved")
    );
});

export {
    addVideoToHistory,
    getUserHistory,
    removeVideoFromHistory,
    removeMultipleFromHistory,
    clearUserHistory,
    getHistoryStats,
};
