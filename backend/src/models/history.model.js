import mongoose, { Schema } from 'mongoose';

const historySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the user who owns the history
            required: true,
        },
        videos: [
            {
                video: {
                    type: Schema.Types.ObjectId,
                    ref: "Video", // Reference to videos in the history
                },
                watchedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    }
);

// Add index for faster queries
historySchema.index({ "videos.watchedAt": -1 });

export const History = mongoose.model('History', historySchema);