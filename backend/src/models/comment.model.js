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
    },
    { timestamps: true }
);

// Hot-path indexes
commentSchema.index({ entityType: 1, entity: 1, createdAt: -1 });
commentSchema.index({ owner: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
