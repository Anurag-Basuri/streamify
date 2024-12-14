import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { WatchLater } from "../models/watchlater.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const getDashboard = asynchandler(async (req, res) => {
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new APIerror(400, "Invalid user ID");
    }

    // Fetch user details
    const user = await User.findById(userId).select("name email avatar");
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    // Fetch user's tweets and tweet count
    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .select("content createdAt");
    const tweetCount = await Tweet.countDocuments({ owner: userId });

    // Fetch user's videos and video count
    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
        .select("title description views createdAt");
    const videoCount = await Video.countDocuments({ owner: userId });

    // Fetch watch later list and count
    const watchLater = await WatchLater.findOne({ owner: userId }).populate(
        "videos",
        "title description"
    );
    const watchLaterCount = watchLater ? watchLater.videos.length : 0;

    // Fetch user's likes and like count
    const likes = await Like.find({ owner: userId })
        .populate("tweet", "content")
        .populate("video", "title");
    const likeCount = await Like.countDocuments({ owner: userId });

    // Fetch user's comments and comment count
    const comments = await Comment.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("tweet", "content")
        .populate("video", "title")
        .select("content createdAt");
    const commentCount = await Comment.countDocuments({ owner: userId });

    // Aggregate data for dashboard
    const dashboardData = {
        user,
        stats: {
            tweetCount,
            videoCount,
            watchLaterCount,
            likeCount,
            commentCount,
        },
        tweets,
        videos,
        watchLater: watchLater ? watchLater.videos : [],
        likes,
        comments,
    };

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                dashboardData,
                "Dashboard fetched successfully"
            )
        );
});

export { getDashboard };
