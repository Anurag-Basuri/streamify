import mongoose from "mongoose";
import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

/**
 * Toggle follow status for a user (social follow for tweets)
 * POST /api/v1/follows/:userId/toggle
 */
export const toggleFollow = asynchandler(async (req, res, next) => {
    const { userId } = req.params;
    const followerId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        return next(new APIerror(400, "Invalid user ID"));
    }

    const followeeId = new mongoose.Types.ObjectId(userId);

    // Cannot follow yourself
    if (followerId.equals(followeeId)) {
        return next(new APIerror(400, "You cannot follow yourself"));
    }

    // Check if user exists
    const userExists = await User.exists({ _id: followeeId });
    if (!userExists) {
        return next(new APIerror(404, "User not found"));
    }

    // Check existing follow
    const existingFollow = await Follow.findOne({
        follower: followerId,
        followee: followeeId,
    });

    let isFollowing = false;

    if (existingFollow) {
        // Unfollow
        await Follow.deleteOne({ _id: existingFollow._id });
        isFollowing = false;
    } else {
        // Follow
        await Follow.create({
            follower: followerId,
            followee: followeeId,
        });
        isFollowing = true;

        // Create notification for the followee
        try {
            await Notification.create({
                recipient: followeeId,
                sender: followerId,
                type: "follow",
                message: "started following you",
            });
        } catch (err) {
            console.error("Failed to create follow notification:", err);
        }
    }

    // Get updated follower count
    const followersCount = await Follow.countDocuments({
        followee: followeeId,
    });

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { isFollowing, followersCount },
                isFollowing
                    ? "Followed successfully"
                    : "Unfollowed successfully"
            )
        );
});

/**
 * Check if current user follows a specific user
 * GET /api/v1/follows/check/:userId
 */
export const checkFollow = asynchandler(async (req, res, next) => {
    const { userId } = req.params;
    const followerId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        return next(new APIerror(400, "Invalid user ID"));
    }

    const followeeId = new mongoose.Types.ObjectId(userId);

    const existingFollow = await Follow.findOne({
        follower: followerId,
        followee: followeeId,
    });

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { isFollowing: !!existingFollow },
                "Follow status fetched"
            )
        );
});

/**
 * Get followers of a user (people who follow them)
 * GET /api/v1/follows/:userId/followers
 */
export const getFollowers = asynchandler(async (req, res, next) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.isValidObjectId(userId)) {
        return next(new APIerror(400, "Invalid user ID"));
    }

    const followeeId = new mongoose.Types.ObjectId(userId);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [followers, totalCount] = await Promise.all([
        Follow.find({ followee: followeeId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("follower", "userName fullName avatar")
            .lean(),
        Follow.countDocuments({ followee: followeeId }),
    ]);

    const result = followers.map((f) => ({
        ...f.follower,
        followedAt: f.createdAt,
    }));

    return res.status(200).json(
        new APIresponse(
            200,
            {
                docs: result,
                totalDocs: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                hasNextPage: skip + result.length < totalCount,
            },
            "Followers fetched successfully"
        )
    );
});

/**
 * Get users that a user is following
 * GET /api/v1/follows/:userId/following
 */
export const getFollowing = asynchandler(async (req, res, next) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.isValidObjectId(userId)) {
        return next(new APIerror(400, "Invalid user ID"));
    }

    const followerId = new mongoose.Types.ObjectId(userId);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [following, totalCount] = await Promise.all([
        Follow.find({ follower: followerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("followee", "userName fullName avatar")
            .lean(),
        Follow.countDocuments({ follower: followerId }),
    ]);

    const result = following.map((f) => ({
        ...f.followee,
        followedAt: f.createdAt,
    }));

    return res.status(200).json(
        new APIresponse(
            200,
            {
                docs: result,
                totalDocs: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                hasNextPage: skip + result.length < totalCount,
            },
            "Following fetched successfully"
        )
    );
});

/**
 * Get current user's following list (shorthand)
 * GET /api/v1/follows/following
 */
export const getMyFollowing = asynchandler(async (req, res, next) => {
    req.params.userId = req.user._id.toString();
    return getFollowing(req, res, next);
});

/**
 * Get current user's followers list (shorthand)
 * GET /api/v1/follows/followers
 */
export const getMyFollowers = asynchandler(async (req, res, next) => {
    req.params.userId = req.user._id.toString();
    return getFollowers(req, res, next);
});
