import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { APIerror, ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video
const getEntityComments = asyncHandler(async (req, res) => {
    const { entityId, entityType } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // validate entity type
    if (!["Video", "Tweet"].includes(entityType)) {
        throw new APIerror(400, "Entity type is wrong");
    }

    if (!mongoose.isValidObjectId(entityId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const match = { entity: entityId, entityType: entityType };

    const comments = await Comment.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } }, // Sort by latest comments
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
        { $unwind: "$ownerDetails" },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    userName: "$ownerDetails.userName",
                    avatar: "$ownerDetails.avatar",
                },
            },
        },
    ]);

    const totalComments = await Comment.countDocuments(match);

    return res.status(200).json(
        new ApiResponse(
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
const addComment = asyncHandler(async (req, res) => {
    const { entityId, entityType } = req.params;
    const { content } = req.body;

    // Validate entityType
    if (!["Video", "Tweet"].includes(entityType)) {
        throw new ApiError(400, "Invalid entity type");
    }

    // Validate entityId
    if (!mongoose.isValidObjectId(entityId)) {
        throw new ApiError(400, "Invalid Entity ID");
    }

    if (!content || content.trim().length < 1) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.create({
        content,
        owner: req.user._id, // Assuming `req.user` contains the authenticated user info
        entity: entityId,
        entityType,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    if (!content || content.trim().length < 1) {
        throw new ApiError(400, "Updated content is required");
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id }, // Ensure the user owns the comment
        { content },
        { new: true, runValidators: true }
    );

    if (!comment) {
        throw new ApiError(
            404,
            "Comment not found or you do not own this comment"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id, // Ensure the user owns the comment
    });

    if (!comment) {
        throw new ApiError(
            404,
            "Comment not found or you do not own this comment"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { getEntityComments, addComment, updateComment, deleteComment };
