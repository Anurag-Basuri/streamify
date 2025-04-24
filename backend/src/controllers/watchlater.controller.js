import mongoose from "mongoose";
import { WatchLater } from "../models/watchlater.model.js";
import { Video } from "../models/video.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const addVideoToWatchLater = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    let watchLater = await WatchLater.findOne({ owner: req.user._id });

    if (!watchLater) {
        watchLater = await WatchLater.create({
            owner: req.user._id,
            videos: [
                {
                    video: videoId,
                    addedAt: new Date(),
                },
            ],
        });
    } else {
        if (watchLater.videos.some(v => v.video.toString() === videoId)) {
            throw new APIerror(400, "Video is already in the watch later list");
        }
        watchLater.videos.push({ video: videoId, addedAt: new Date() });
        await watchLater.save();
    }

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                watchLater,
                "Video successfully added to watch later"
            )
        );
});

const removeVideoFromWatchLater = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    let watchLater = await WatchLater.findOne({ owner: req.user._id });
    if (!watchLater) {
        throw new APIerror(404, "Watch later list not found");
    }

    const originalLength = watchLater.videos.length;
    watchLater.videos = watchLater.videos.filter(v => v.video.toString() !== videoId);
    if (watchLater.videos.length === originalLength) {
        throw new APIerror(404, "Video not found in watch later list");
    }

    await watchLater.save();

    return res.status(200).json(new APIresponse(200, watchLater, "Video removed from watch later"));
});

const getWatchLaterVideos = asynchandler(async (req, res) => {
    let watchLater = await WatchLater.findOne({ owner: req.user._id })
        .populate({
            path: "videos.video",
            model: "Video",
        });
    if (!watchLater) {
        watchLater = await WatchLater.create({ owner: req.user._id, videos: [] });
    }
    // Sort videos by addedAt descending (most recent first)
    const sortedVideos = watchLater.videos.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    return res.status(200).json(new APIresponse(200, { videos: sortedVideos }, "Fetched watch later videos"));
});

export { addVideoToWatchLater, removeVideoFromWatchLater, getWatchLaterVideos };
