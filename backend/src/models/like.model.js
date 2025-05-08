import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

export const Like = mongoose.model("Like", likeSchema);
