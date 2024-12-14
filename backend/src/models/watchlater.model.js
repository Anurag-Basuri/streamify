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
                type: Schema.Types.ObjectId,
                ref: "Video", // Reference to the Video model
                required: true,
            },
        ],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export const WatchLater = mongoose.model("WatchLater", watchlaterSchema);
