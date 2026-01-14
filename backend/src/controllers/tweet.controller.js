import mongoose from "mongoose";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Follow } from "../models/follow.model.js";
import { Activity } from "../models/activity.model.js";

// Common aggregation pipeline for tweets
const getCommonTweetPipeline = (userId) => {
    return [
        // Lookup owner details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: "$owner" },
        // Lookup likes count
        {
            $lookup: {
                from: "likes",
                let: { tweetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$likedEntity", "$$tweetId"] },
                                    { $eq: ["$entityType", "Tweet"] },
                                ],
                            },
                        },
                    },
                ],
                as: "likesData",
            },
        },
        // Lookup if current user has liked
        ...(userId
            ? [
                  {
                      $lookup: {
                          from: "likes",
                          let: { tweetId: "$_id" },
                          pipeline: [
                              {
                                  $match: {
                                      $expr: {
                                          $and: [
                                              {
                                                  $eq: [
                                                      "$likedEntity",
                                                      "$$tweetId",
                                                  ],
                                              },
                                              { $eq: ["$entityType", "Tweet"] },
                                              {
                                                  $eq: [
                                                      "$likedBy",
                                                      new mongoose.Types.ObjectId(
                                                          userId
                                                      ),
                                                  ],
                                              },
                                          ],
                                      },
                                  },
                              },
                          ],
                          as: "userLike",
                      },
                  },
              ]
            : []),
        // Lookup comments count
        {
            $lookup: {
                from: "comments",
                let: { tweetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$entity", "$$tweetId"] },
                                    { $eq: ["$entityType", "Tweet"] },
                                ],
                            },
                        },
                    },
                ],
                as: "commentsData",
            },
        },
        // Lookup follow status (isFollowing) for social feed
        ...(userId
            ? [
                  {
                      $lookup: {
                          from: "follows",
                          let: { ownerId: "$owner._id" },
                          pipeline: [
                              {
                                  $match: {
                                      $expr: {
                                          $and: [
                                              {
                                                  $eq: [
                                                      "$followee",
                                                      "$$ownerId",
                                                  ],
                                              },
                                              {
                                                  $eq: [
                                                      "$follower",
                                                      new mongoose.Types.ObjectId(
                                                          userId
                                                      ),
                                                  ],
                                              },
                                          ],
                                      },
                                  },
                              },
                          ],
                          as: "followData",
                      },
                  },
              ]
            : []),
        // Project final shape
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: 1,
                likes: { $size: "$likesData" },
                isLiked: userId ? { $gt: [{ $size: "$userLike" }, 0] } : false,
                commentsCount: { $size: "$commentsData" },
                isFollowing: userId
                    ? { $gt: [{ $size: "$followData" }, 0] }
                    : false,
            },
        },
    ];
};

const createTweet = asynchandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length < 1) {
        throw new APIerror(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content,
    });

    // Log activity
    Activity.log({
        user: req.user._id,
        type: "tweet_create",
        entityType: "Tweet",
        entityId: tweet._id,
        metadata: { contentPreview: content.substring(0, 50) },
    });

    return res
        .status(201)
        .json(new APIresponse(201, tweet, "Tweet created successfully"));
});

const get_user_tweet = asynchandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new APIerror(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 }) // Sort tweets by newest first
        .select("content createdAt"); // Select only necessary fields

    return res
        .status(200)
        .json(new APIresponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new APIerror(400, "Invalid tweet ID");
    }

    if (!content || content.trim().length < 1) {
        throw new APIerror(400, "Content is required for updating the tweet");
    }

    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: req.user._id },
        { content },
        { new: true, runValidators: true }
    );

    if (!tweet) {
        throw new APIerror(404, "Tweet not found or you don't own this tweet");
    }

    return res
        .status(200)
        .json(new APIresponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new APIerror(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id,
    });

    if (!tweet) {
        throw new APIerror(404, "Tweet not found or you don't own this tweet");
    }

    return res
        .status(204)
        .json(new APIresponse(204, null, "Tweet deleted successfully"));
});

const get_latest_tweets = asynchandler(async (req, res) => {
    const currentUserId = req.user?._id;

    const tweets = await Tweet.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 100 }, // Increased limit slightly
        ...getCommonTweetPipeline(currentUserId),
    ]);

    return res
        .status(200)
        .json(
            new APIresponse(200, tweets, "Latest tweets fetched successfully")
        );
});

const get_following_tweets = asynchandler(async (req, res) => {
    const currentUserId = req.user._id;

    // 1. Find users the current user is following (social follow)
    const follows = await Follow.find({
        follower: currentUserId,
    }).select("followee");

    const followedUserIds = follows.map((f) => f.followee);

    if (followedUserIds.length === 0) {
        return res
            .status(200)
            .json(new APIresponse(200, [], "No following tweets found"));
    }

    // 2. Aggregate tweets from followed users
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: { $in: followedUserIds },
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
        ...getCommonTweetPipeline(currentUserId),
    ]);

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                tweets,
                "Following tweets fetched successfully"
            )
        );
});

export {
    createTweet,
    get_user_tweet,
    updateTweet,
    deleteTweet,
    get_latest_tweets,
    get_following_tweets,
};
