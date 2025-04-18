import mongoose from "mongoose";
import { History } from "../models/history.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Add video to history
const addVideoToHistory = asynchandler(async (req, res) => {
    const { videoId } = req.body;
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

    // Check if the history already exists for the user
    let history = await History.findOne({ user: userId });
    if (!history) {
        // Create a new history entry if it doesn't exist
        history = new History({ user: userId, videos: [] });
    }

    // Add the video to the user's history if it doesn't already exist
    if (!history.videos.includes(videoId)) {
        history.videos.push(videoId);
        await history.save();
    }

    res.status(200).json(new APIresponse(200, history));
});

// Get user's history
const getUserHistory = asynchandler(async (req, res) => {
    const userId = req.user._id;

    // Check if the user exists
    const user = await User.findById(userId);
    if(!user) {
        throw new APIerror(404, "User not found");
    }

    // Find the user's history
    const history = await History.findOne({ user: userId }).populate("videos");
    if (!history) {
        throw new APIerror(404, "History not found");
    }
    res.status(200).json(new APIresponse(200, history, "History retrieved successfully"));
}
);
