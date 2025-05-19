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
            ref: "Tweet",
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
