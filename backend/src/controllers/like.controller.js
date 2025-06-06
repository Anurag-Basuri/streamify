import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const toggleVideoLike = asynchandler(async (req, res) => {
    console.log("Toggle video like called");
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        console.error("Invalid video ID:", videoId);
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        console.error("Video not found:", videoId);
        throw new APIerror(404, "Video not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: videoId,
        entityType: "Video",
    });

    if (existLike) {
        console.log("Existing like found. Removing like for video:", videoId);
        await Like.deleteOne({ _id: existLike._id });

        // Count the number of likes
        const likes = await Like.countDocuments({ likedEntity: videoId, entityType: "Video" });

        console.log("Video unliked successfully. Updated likes count:", likes);
        return res
            .status(200)
            .json(
                new APIresponse(200, { likes: likes, state: 0 }, "Video unliked")
            );
    }

    console.log("No existing like found. Adding like for video:", videoId);

    try {
        // Create a new like
        await Like.create({
            likedBy: req.user._id,
            likedEntity: videoId,
            entityType: "Video",
        });

        // Count the number of likes
        const likes = await Like.countDocuments({ likedEntity: videoId, entityType: "Video" });

        console.log("Video liked successfully. Updated likes count:", likes);
        return res
            .status(201)
            .json(
                new APIresponse(201, { likes: likes, state: 1 }, "Video liked")
            );
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (race condition)
            const likes = await Like.countDocuments({ likedEntity: videoId, entityType: "Video" });
            return res
                .status(200)
                .json(
                    new APIresponse(200, { likes: likes, state: 1 }, "Video already liked")
                );
        }
        throw error;
    }
});

const toggleCommentLike = asynchandler(async (req, res) => {
    console.log("Toggle comment like called");
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        console.error("Invalid comment ID:", commentId);
        throw new APIerror(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        console.error("Comment not found:", commentId);
        throw new APIerror(404, "Comment not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });

    if (existLike) {
        console.log("Existing like found. Removing like for comment:", commentId);
        await Like.deleteOne({ _id: existLike._id });

        // Count the number of likes
        const likes = await Like.countDocuments({ likedEntity: commentId, entityType: "Comment" });

        console.log("Comment unliked successfully. Updated likes count:", likes);
        return res
            .status(200)
            .json(
                new APIresponse(200, { likes: likes, state: 0 }, "Comment unliked")
            );
    }

    console.log("No existing like found. Adding like for comment:", commentId);

    try {
        // Create a new like
        await Like.create({
            likedBy: req.user._id,
            likedEntity: commentId,
            entityType: "Comment",
        });

        // Count the number of likes
        const likes = await Like.countDocuments({ likedEntity: commentId, entityType: "Comment" });

        console.log("Comment liked successfully. Updated likes count:", likes);
        return res
            .status(201)
            .json(
                new APIresponse(201, { likes: likes, state: 1 }, "Comment liked")
            );
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (race condition)
            const likes = await Like.countDocuments({ likedEntity: commentId, entityType: "Comment" });
            return res
                .status(200)
                .json(
                    new APIresponse(200, { likes: likes, state: 1 }, "Comment already liked")
                );
        }
        throw error;
    }
});

const toggleTweetLike = asynchandler(async (req, res) => {
    console.log("Toggle tweet like called");
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        console.error("Invalid tweet ID:", tweetId);
        throw new APIerror(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        console.error("Tweet not found:", tweetId);
        throw new APIerror(404, "Tweet not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: tweetId,
        entityType: "Tweet",
    });

    if (existLike) {
        console.log("Existing like found. Removing like for tweet:", tweetId);
        await Like.deleteOne({ _id: existLike._id });

        // count the number of likes.
        const likes = await Like.countDocuments({ likedEntity: tweetId, entityType: "Tweet" });

        console.log(
            "Tweet unliked successfully. Updated likes count:",
            likes
        );
        return res
            .status(200)
            .json(
                new APIresponse(200, { likes: likes, state: 0 }, "Tweet unliked")
            );
    }

    console.log("No existing like found. Adding like for tweet:", tweetId);

    try {
        // Create a new like
        await Like.create({
            likedBy: req.user._id,
            likedEntity: tweetId,
            entityType: "Tweet",
        });

        // Count the number of likes
        const likes = await Like.countDocuments({ likedEntity: tweetId, entityType: "Tweet" });

        console.log("Tweet liked successfully. Updated likes count:", likes);
        return res
            .status(201)
            .json(new APIresponse(201, { likes: likes, state: 1 }, "Tweet liked"));
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (race condition)
            const likes = await Like.countDocuments({ likedEntity: tweetId, entityType: "Tweet" });
            return res
                .status(200)
                .json(
                    new APIresponse(200, { likes: likes, state: 1 }, "Tweet already liked")
                );
        }
        throw error;
    }
});

const getLikedEntities = asynchandler(async (req, res) => {
    const { entityType } = req.query;

    if (!entityType || !["Video", "Comment", "Tweet"].includes(entityType)) {
        throw new APIerror(400, "Invalid or missing entity type");
    }

    const likes = await Like.find({ 
        likedBy: req.user._id,
        entityType 
    })
    .populate("likedEntity")
    .exec();

    return res
        .status(200)
        .json(
            new APIresponse(200, likes, "Liked entities fetched successfully")
        );
});

const getUserLikedVideos = asynchandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const likes = await Like.find({ 
        likedBy: req.user._id,
        entityType: "Video"
    })
    .populate({
        path: "likedEntity",
        populate: {
            path: "owner",
            select: "userName avatar"
        }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Like.countDocuments({ 
        likedBy: req.user._id,
        entityType: "Video"
    });

    return res
        .status(200)
        .json(
            new APIresponse(200, {
                videos: likes.map(like => like.likedEntity),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }, "Liked videos fetched successfully")
        );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedEntities,
    getUserLikedVideos
};