import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const toggleVideoLike = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(400, "Video not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: videoId,
        entityType: "Video",
    });
    if (existLike) {
        await existLike.remove();
        res.status(200).json(new APIresponse(200, null, "Video unliked"));
    }

    const like = await Like.create({
        likedBy: req.user._id,
        likedEntity: videoId,
        entityType: "Video",
    });

    return res.status(201).json(new APIresponse(201, like, "Video liked"));
});

const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new APIerror(400, "Comment not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });
    if (existLike) {
        await existLike.remove();
        res.status(200).json(new APIresponse(200, null, "Comment unliked"));
    }

    const like = await Like.create({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });

    return res.status(201).json(new APIresponse(201, like, "Comment liked"));
});

const toggleTweetLike = asynchandler(async (req, res) => {
    console.log("Toggle tweet like called");
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new APIerror(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new APIerror(400, "Tweet not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: tweetId,
        entityType: "Tweet",
    });
    if (existLike) {
        await existLike.remove();
        res.status(200).json(new APIresponse(200, null, "Tweet unliked"));
    }

    const like = await Like.create({
        likedBy: req.user._id,
        likedEntity: tweetId,
        entityType: "Tweet",
    });

    return res.status(201).json(new APIresponse(201, like, "Tweet liked"));
});

const getLikedEntities = asynchandler(async (req, res) => {
    const { entityType } = req.query;

    if (!entityType || !["Video", "Comment", "Tweet"].includes(entityType)) {
        throw new APIerror(400, "Invalid or missing entity type");
    }

    // Determine the fields to populate based on entity type
    let populateFields = "";
    switch (entityType) {
        case "Video":
            populateFields = "title description thumbnail";
            break;
        case "Comment":
            populateFields = "content createdAt";
            break;
        case "Tweet":
            populateFields = "content createdAt";
            break;
        default:
            throw new APIerror(400, "Unsupported entity type");
    }

    const likes = await Like.find({
        likedBy: req.user._id,
        entityType, // Use the dynamic entity type
    })
        .populate("likedEntity", populateFields) // Dynamically populate relevant fields
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                likes,
                `Liked ${entityType}s fetched successfully`
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedEntities };
