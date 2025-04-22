import mongoose from "mongoose";
import { History } from "../models/history.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Add video to history
const addVideoToHistory = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    // Find or create history for the user
    let history = await History.findOne({ user: userId });
    if (!history) {
        history = new History({ user: userId, videos: [] });
    }

    // Remove the video if it already exists in history
    history.videos = history.videos.filter(
        (item) => !item._id.equals(videoId)
    );

    // Add the video to the beginning of the array with current timestamp
    history.videos.unshift({
        video: videoId,
        watchedAt: new Date(),
    });

    // Limit history to last 100 videos
    if (history.videos.length > 100) {
        history.videos = history.videos.slice(0, 100);
    }

    await history.save();

    res.status(200).json(
        new APIresponse(200, history, "Video added to history successfully")
    );
});

// Get user's history
const getUserHistory = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const history = await History.findOne({ user: userId })
        .populate({
            path: "videos.video",
            select: "title thumbnail duration views owner createdAt",
            populate: {
                path: "owner",
                select: "userName avatar",
            },
        })
        .sort({ "videos.watchedAt": -1 });

    if (!history) {
        return res
            .status(200)
            .json(new APIresponse(200, { videos: [] }, "No history found"));
    }

    res.status(200).json(
        new APIresponse(200, history, "History retrieved successfully")
    );
});

// Remove video from history
const removeVideoFromHistory = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Validate videoId
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const history = await History.findOne({ user: userId });
    if (!history) {
        throw new APIerror(404, "History not found");
    }

    // Check if video exists in history
    const videoIndex = history.videos.findIndex(
        (item) => item.video.toString() === videoId
    );

    if (videoIndex === -1) {
        throw new APIerror(404, "Video not found in history");
    }

    // Remove the video from history
    history.videos.splice(videoIndex, 1);
    await history.save();

    res.status(200).json(
        new APIresponse(200, history, "Video removed from history successfully")
    );
});

// Clear user's history
const clearUserHistory = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const history = await History.findOne({ user: userId });
    if (!history) {
        throw new APIerror(404, "History not found");
    }

    history.videos = [];
    await history.save();

    res.status(200).json(
        new APIresponse(200, history, "History cleared successfully")
    );
});

// Export the controller functions
export {
    addVideoToHistory,
    getUserHistory,
    removeVideoFromHistory,
    clearUserHistory,
};
