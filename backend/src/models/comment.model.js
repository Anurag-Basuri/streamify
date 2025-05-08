import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet", // Reference to the Tweet model
            required: true,
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

export const Comment = mongoose.model("Comment", commentSchema);
