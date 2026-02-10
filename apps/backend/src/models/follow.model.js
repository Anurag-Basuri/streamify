import mongoose, { Schema } from "mongoose";

/**
 * Follow Model
 * Represents a social "follow" relationship (for tweets/social feed).
 * Separate from Subscription which is for video channel subscriptions.
 */
const followSchema = new Schema(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        followee: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

// Ensure a user can only follow another user once
followSchema.index({ follower: 1, followee: 1 }, { unique: true });

// Efficient queries for "who follows this user" (followers list)
followSchema.index({ followee: 1, createdAt: -1 });

// Efficient queries for "who does this user follow" (following list)
followSchema.index({ follower: 1, createdAt: -1 });

export const Follow = mongoose.model("Follow", followSchema);
