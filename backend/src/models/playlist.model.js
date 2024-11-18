import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the user who owns the playlist
            required: true,
        },
        name: {
            type: String,
            required: true, // Playlist name is mandatory
            trim: true,
            minlength: [3, "Minimum length is 3 characters"],
            maxlength: [50, "Maximum length is 50 characters"],
        },
        description: {
            type: String,
            trim: true, // Optional description of the playlist
            maxlength: [500, "Maximum length is 500 characters"],
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video", // Reference to videos in the playlist
            },
        ],
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
