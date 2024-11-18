import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        content: {
            type: String,
            required: true, // Content of the tweet is mandatory
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
