import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { notifyVideoLike } from "../utils/notifications.js";

// Toggle like for a video
const toggleVideoLike = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate(
        "owner",
        "_id userName fullName"
    );
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: videoId,
        entityType: "Video",
    });

    if (existLike) {
        await Like.deleteOne({ _id: existLike._id });
        const likes = await Like.countDocuments({
            likedEntity: videoId,
            entityType: "Video",
        });

        return res
            .status(200)
            .json(new APIresponse(200, { likes, state: 0 }, "Video unliked"));
    }

    try {
        await Like.create({
            likedBy: req.user._id,
            likedEntity: videoId,
            entityType: "Video",
        });

        const likes = await Like.countDocuments({
            likedEntity: videoId,
            entityType: "Video",
        });

        // Send notification to video owner (async, non-blocking)
        notifyVideoLike({
            videoOwner: video.owner,
            liker: req.user,
            video,
        }).catch((err) => console.error("Notification error:", err.message));

        return res
            .status(201)
            .json(new APIresponse(201, { likes, state: 1 }, "Video liked"));
    } catch (error) {
        if (error.code === 11000) {
            const likes = await Like.countDocuments({
                likedEntity: videoId,
                entityType: "Video",
            });
            return res
                .status(200)
                .json(
                    new APIresponse(
                        200,
                        { likes, state: 1 },
                        "Video already liked"
                    )
                );
        }
        throw error;
    }
});

// Toggle like for a comment
const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new APIerror(404, "Comment not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });

    if (existLike) {
        await Like.deleteOne({ _id: existLike._id });
        const likes = await Like.countDocuments({
            likedEntity: commentId,
            entityType: "Comment",
        });

        return res
            .status(200)
            .json(new APIresponse(200, { likes, state: 0 }, "Comment unliked"));
    }

    try {
        await Like.create({
            likedBy: req.user._id,
            likedEntity: commentId,
            entityType: "Comment",
        });

        const likes = await Like.countDocuments({
            likedEntity: commentId,
            entityType: "Comment",
        });

        return res
            .status(201)
            .json(new APIresponse(201, { likes, state: 1 }, "Comment liked"));
    } catch (error) {
        if (error.code === 11000) {
            const likes = await Like.countDocuments({
                likedEntity: commentId,
                entityType: "Comment",
            });
            return res
                .status(200)
                .json(
                    new APIresponse(
                        200,
                        { likes, state: 1 },
                        "Comment already liked"
                    )
                );
        }
        throw error;
    }
});

// Toggle like for a tweet
const toggleTweetLike = asynchandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new APIerror(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new APIerror(404, "Tweet not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: tweetId,
        entityType: "Tweet",
    });

    if (existLike) {
        await Like.deleteOne({ _id: existLike._id });
        const likes = await Like.countDocuments({
            likedEntity: tweetId,
            entityType: "Tweet",
        });

        return res
            .status(200)
            .json(new APIresponse(200, { likes, state: 0 }, "Tweet unliked"));
    }

    try {
        await Like.create({
            likedBy: req.user._id,
            likedEntity: tweetId,
            entityType: "Tweet",
        });

        const likes = await Like.countDocuments({
            likedEntity: tweetId,
            entityType: "Tweet",
        });

        return res
            .status(201)
            .json(new APIresponse(201, { likes, state: 1 }, "Tweet liked"));
    } catch (error) {
        if (error.code === 11000) {
            const likes = await Like.countDocuments({
                likedEntity: tweetId,
                entityType: "Tweet",
            });
            return res
                .status(200)
                .json(
                    new APIresponse(
                        200,
                        { likes, state: 1 },
                        "Tweet already liked"
                    )
                );
        }
        throw error;
    }
});

// Get all liked entities by the user
const getLikedEntities = asynchandler(async (req, res) => {
    const { entityType } = req.query;

    if (!entityType || !["Video", "Comment", "Tweet"].includes(entityType)) {
        throw new APIerror(400, "Invalid or missing entity type");
    }

    const likes = await Like.find({
        likedBy: req.user._id,
        entityType,
    })
        .populate("likedEntity")
        .exec();

    return res
        .status(200)
        .json(
            new APIresponse(200, likes, "Liked entities fetched successfully")
        );
});

// Get user's liked videos with pagination
const getUserLikedVideos = asynchandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const likes = await Like.find({
        likedBy: req.user._id,
        entityType: "Video",
    })
        .populate({
            path: "likedEntity",
            populate: {
                path: "owner",
                select: "userName avatar",
            },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Like.countDocuments({
        likedBy: req.user._id,
        entityType: "Video",
    });

    return res.status(200).json(
        new APIresponse(
            200,
            {
                videos: likes.map((like) => like.likedEntity),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                },
            },
            "Liked videos fetched successfully"
        )
    );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedEntities,
    getUserLikedVideos,
};
