import mongoose, { Schema } from 'mongoose';

const historySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Reference to the user who owns the history
            required: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video', // Reference to videos in the history
            },
        ],
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    }
);

export const History = mongoose.model('History', historySchema);