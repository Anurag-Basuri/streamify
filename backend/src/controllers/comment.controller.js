import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Get all comments for an entity (Video or Tweet)
const getEntityComments = asynchandler(async (req, res) => {
    const { entityId, entityType } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate entity type
    if (!["Video", "Tweet"].includes(entityType)) {
        throw new APIerror(400, "Invalid entity type");
    }

    // Validate entity ID
    if (!mongoose.isValidObjectId(entityId)) {
        throw new APIerror(400, "Invalid Entity ID");
    }

    const match = { entity: entityId, entityType };

    const comments = await Comment.aggregate([
        {
            $match: {
                entity: new mongoose.Types.ObjectId(entityId),
                entityType,
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: +limit },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedEntity",
                as: "likes",
            },
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    userName: "$ownerDetails.userName",
                    avatar: "$ownerDetails.avatar",
                },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $in: [
                        new mongoose.Types.ObjectId(req.user._id),
                        "$likes.likedBy",
                    ],
                },
            },
        },
    ]);

    const totalComments = await Comment.countDocuments(match);

    return res.status(200).json(
        new APIresponse(
            200,
            {
                comments,
                pagination: {
                    currentPage: +page,
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments,
                },
            },
            "Comments fetched successfully"
        )
    );
});

// Add a comment to an entity (Video or Tweet)
const addComment = asynchandler(async (req, res) => {
    const { entityId, entityType } = req.params;
    const { content } = req.body;

    // Validate entity type
    if (!["Video", "Tweet"].includes(entityType)) {
        throw new APIerror(400, "Invalid entity type");
    }

    // Validate entity ID
    if (!mongoose.isValidObjectId(entityId)) {
        throw new APIerror(400, "Invalid Entity ID");
    }

    if (!content || content.trim().length < 1) {
        throw new APIerror(400, "Comment content is required");
    }

    const comment = await Comment.create({
        content,
        owner: req.user._id,
        entity: entityId,
        entityType,
    });

    return res
        .status(201)
        .json(new APIresponse(201, comment, "Comment added successfully"));
});

// Update a comment
const updateComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid Comment ID");
    }

    if (!content || content.trim().length < 1) {
        throw new APIerror(400, "Updated content is required");
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id }, // Ensure the user owns the comment
        { content },
        { new: true, runValidators: true }
    );

    if (!comment) {
        throw new APIerror(
            404,
            "Comment not found or you do not own this comment"
        );
    }

    return res
        .status(200)
        .json(new APIresponse(200, comment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid Comment ID");
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id, // Ensure the user owns the comment
    });

    if (!comment) {
        throw new APIerror(
            404,
            "Comment not found or you do not own this comment"
        );
    }

    return res
        .status(200)
        .json(new APIresponse(200, null, "Comment deleted successfully"));
});

// Toggle like for a comment
const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid Comment ID");
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

        const likesCount = await Like.countDocuments({
            likedEntity: commentId,
            entityType: "Comment",
        });

        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    { likes: likesCount, isLiked: false },
                    "Comment unliked"
                )
            );
    }

    await Like.create({
        likedBy: req.user._id,
        likedEntity: commentId,
        entityType: "Comment",
    });

    const likesCount = await Like.countDocuments({
        likedEntity: commentId,
        entityType: "Comment",
    });

    return res
        .status(201)
        .json(
            new APIresponse(
                201,
                { likes: likesCount, isLiked: true },
                "Comment liked"
            )
        );
});

// Number of comments 

export {
    getEntityComments,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
};
