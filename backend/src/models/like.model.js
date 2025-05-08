import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        likedEntity: {
            type: Schema.Types.ObjectId,
            refPath: "entityType", // Dynamic reference based on entityType
            required: true,
        },
        entityType: {
            type: String,
            enum: ["Tweet", "Comment", "Video"], // Supported entity types
            required: true,
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

// Add a virtual field for populating tweets
likeSchema.virtual("tweet", {
    ref: "Tweet", // Reference to the Tweet model
    localField: "likedEntity",
    foreignField: "_id",
    justOne: true,
});

export const Like = mongoose.model("Like", likeSchema);
