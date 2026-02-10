import mongoose, { Schema } from "mongoose";

const watchlaterSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        videos: [
            {
                video: {
                    type: Schema.Types.ObjectId,
                    ref: "Video",
                    required: true,
                },
                addedAt: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
                remindAt: {
                    type: Date,
                    required: false,
                },
            },
        ],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

watchlaterSchema.index({ owner: 1 }, { unique: true });
watchlaterSchema.index({ "videos.video": 1, owner: 1 });

export const WatchLater = mongoose.model("WatchLater", watchlaterSchema);
