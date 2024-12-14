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
            videos: [videoId],
        });
    } else {
        if (watchLater.videos.includes(videoId)) {
            throw new APIerror(400, "Video is already in the watch later list");
        }

        watchLater.videos.push(videoId);
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

    const watchLater = await WatchLater.findOne({ owner: req.user._id });

    if (!watchLater || !watchLater.videos.includes(videoId)) {
        throw new APIerror(404, "Video not found in the watch later list");
    }

    watchLater.videos = watchLater.videos.filter(
        (id) => id.toString() !== videoId
    );
    await watchLater.save();

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                watchLater,
                "Video successfully removed from watch later"
            )
        );
});

const getWatchLaterVideos = asynchandler(async (req, res) => {
    const watchLater = await WatchLater.findOne({
        owner: req.user._id,
    }).populate("videos");

    if (!watchLater || watchLater.videos.length === 0) {
        return res
            .status(404)
            .json(
                new APIresponse(
                    404,
                    null,
                    "No videos found in watch later list"
                )
            );
    }

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                watchLater.videos,
                "Watch later videos fetched successfully"
            )
        );
});

export { addVideoToWatchLater, removeVideoFromWatchLater, getWatchLaterVideos };
