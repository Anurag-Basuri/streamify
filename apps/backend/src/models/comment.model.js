import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        entity: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        entityType: {
            type: String,
            enum: ["Video", "Tweet"],
            required: true,
        },
        // Threading support - null for top-level comments
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
        // Creator can pin important comments
        isPinned: {
            type: Boolean,
            default: false,
        },
        // Creator hearts (content owner can heart comments)
        hearts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        // Cached reply count for performance
        replyCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Hot-path indexes
commentSchema.index({ entityType: 1, entity: 1, parentId: 1, createdAt: -1 });
commentSchema.index({ owner: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
