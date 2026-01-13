import mongoose from "mongoose";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asynchandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length < 1) {
        throw new APIerror(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content,
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
    // Get current user ID if authenticated (may be undefined for guests)
    const currentUserId = req.user?._id;

    const tweets = await Tweet.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        // Lookup owner details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
        // Lookup if current user has liked (only if user is authenticated)
        ...(currentUserId
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
                                                      currentUserId,
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
                                    { $eq: ["$entityId", "$$tweetId"] },
                                    { $eq: ["$entityType", "Tweet"] },
                                ],
                            },
                        },
                    },
                ],
                as: "commentsData",
            },
        },
        // Project final shape
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                "owner._id": 1,
                "owner.userName": 1,
                "owner.avatar": 1,
                "owner.fullName": 1,
                likes: { $size: "$likesData" },
                isLiked: currentUserId
                    ? { $gt: [{ $size: "$userLike" }, 0] }
                    : false,
                commentsCount: { $size: "$commentsData" },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new APIresponse(200, tweets, "Latest tweets fetched successfully")
        );
});

export {
    createTweet,
    get_user_tweet,
    updateTweet,
    deleteTweet,
    get_latest_tweets,
};
