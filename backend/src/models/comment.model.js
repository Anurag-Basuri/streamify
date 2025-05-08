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
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet", // Ensure this matches the Tweet model
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video", // Ensure this matches the Video model
        },
    },
    { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
