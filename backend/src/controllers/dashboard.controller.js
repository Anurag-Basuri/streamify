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

    // Validate user ID
    if (!mongoose.isValidObjectId(userId)) {
        throw new APIerror(400, "Invalid user ID");
    }

    // Fetch user details
    const user = await User.findById(userId).select("name email avatar");
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    try {
        // Fetch data in parallel
        const [
            tweets,
            tweetCount,
            videos,
            videoCount,
            watchLater,
            likes,
            likeCount,
            comments,
            commentCount,
        ] = await Promise.all([
            Tweet.find({ owner: userId })
                .sort({ createdAt: -1 })
                .select("content createdAt"),
            Tweet.countDocuments({ owner: userId }),
            Video.find({ owner: userId })
                .sort({ createdAt: -1 })
                .select("title description views createdAt"),
            Video.countDocuments({ owner: userId }),
            WatchLater.findOne({ owner: userId }).populate(
                "videos",
                "title description"
            ),
            Like.find({ owner: userId })
                .populate("tweet", "content")
                .populate("video", "title"),
            Like.countDocuments({ owner: userId }),
            Comment.find({ owner: userId })
                .sort({ createdAt: -1 })
                .populate("tweet", "content")
                .populate("video", "title")
                .select("content createdAt"),
            Comment.countDocuments({ owner: userId }),
        ]);

        // Aggregate data for dashboard
        const dashboardData = {
            user,
            stats: {
                tweetCount,
                videoCount,
                watchLaterCount: watchLater ? watchLater.videos.length : 0,
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
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw new APIerror(500, "Failed to fetch dashboard data");
    }
});

export { getDashboard };
