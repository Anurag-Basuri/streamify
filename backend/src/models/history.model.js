import mongoose, { Schema } from 'mongoose';

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
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Add index for faster queries
historySchema.index({ "videos.watchedAt": -1 });

export const History = mongoose.model('History', historySchema);