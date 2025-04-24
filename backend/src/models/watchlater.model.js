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
                }
            },
        ],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export const WatchLater = mongoose.model("WatchLater", watchlaterSchema);
