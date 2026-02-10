import mongoose, { Schema } from "mongoose";

const historySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        videos: [
            {
                video: {
                    type: Schema.Types.ObjectId,
                    ref: "Video",
                },
                watchedAt: {
                    type: Date,
                    default: Date.now,
                },
                // Playback position in seconds where user left off
                playbackTimestamp: {
                    type: Number,
                    default: 0,
                },
                // Video duration for calculating progress percentage
                videoDuration: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Add index for faster queries
historySchema.index({ "videos.watchedAt": -1 });

export const History = mongoose.model("History", historySchema);
