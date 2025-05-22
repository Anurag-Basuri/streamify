// like.model.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likedEntity: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "entityType",
            required: true,
        },
        entityType: {
            type: String,
            required: true,
            enum: ["Video", "Tweet", "Comment"],
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
