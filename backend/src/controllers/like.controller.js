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
        console.error("Invalid video ID:", videoId);
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        console.error("Video not found:", videoId);
        throw new APIerror(400, "Video not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: videoId,
        entityType: "Video",
    });

    if (existLike) {
        console.log("Existing like found. Removing like for video:", videoId);
        await Like.deleteOne({ _id: existLike._id });

        // Decrement the like count on the video
        video.likes = Math.max(0, (video.likes || 0) - 1);
        await video.save();

        console.log(
            "Video unliked successfully. Updated likes count:",
            video.likes
        );
        return res
            .status(200)
            .json(
                new APIresponse(200, { likes: video.likes }, "Video unliked")
            );
    }

    console.log("No existing like found. Adding like for video:", videoId);

    // Create a new like
    await Like.create({
        likedBy: req.user._id,
        likedEntity: videoId,
        entityType: "Video",
    });

    // Increment the like count on the video
    video.likes = (video.likes || 0) + 1;
    await video.save();

    console.log("Video liked successfully. Updated likes count:", video.likes);
    return res
        .status(201)
        .json(new APIresponse(201, { likes: video.likes }, "Video liked"));
});

const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        console.error("Invalid comment ID:", commentId);
        throw new APIerror(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        console.error("Comment not found:", commentId);
        throw new APIerror(400, "Comment not found");
    }

    const existLike = await Like.findOne({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });

    if (existLike) {
        console.log(
            "Existing like found. Removing like for comment:",
            commentId
        );
        await Like.deleteOne({ _id: existLike._id });

        // Decrement the like count on the comment
        comment.likes = Math.max(0, (comment.likes || 0) - 1);
        await comment.save();

        console.log(
            "Comment unliked successfully. Updated likes count:",
            comment.likes
        );
        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    { likes: comment.likes },
                    "Comment unliked"
                )
            );
    }

    console.log("No existing like found. Adding like for comment:", commentId);

    // Create a new like
    await Like.create({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });

    // Increment the like count on the comment
    comment.likes = (comment.likes || 0) + 1;
    await comment.save();

    console.log(
        "Comment liked successfully. Updated likes count:",
        comment.likes
    );
    return res
        .status(201)
        .json(new APIresponse(201, { likes: comment.likes }, "Comment liked"));
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
        throw new APIerror(400, "Tweet not found");
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
                new APIresponse(200, { likes: likes, state:0 }, "Tweet unliked")
            );
    }

    console.log("No existing like found. Adding like for tweet:", tweetId);

    // Create a new like
    await Like.create({
        likedBy: req.user._id,
        likedEntity: tweetId,
        entityType: "Tweet",
    });

    // Increment the like count on the tweet
    const likes = await Like.countDocuments({ likedEntity: tweetId, entityType: "Tweet" });

    console.log("Tweet liked successfully. Updated likes count:", likes);
    return res
        .status(201)
        .json(new APIresponse(201, { likes: likes,state: 1 }, "Tweet liked"));
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
