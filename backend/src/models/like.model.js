import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User who liked
            required: true,
        },
        likedEntity: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        entiyType: {
            type: String,
            required: true,
            enum: ["Video", "Tweet", "Comment"], // Entity types
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

export const Like = mongoose.model("Like", likeSchema);
