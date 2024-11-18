import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true, // Content of the comment is mandatory
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the user who made the comment
            required: true,
        },
        entity: {
            type: Schema.Types.ObjectId,
            required: true, // Reference to the entity being commented on
            refPath: "entityType", // Dynamic reference based on `entityType`
        },
        entityType: {
            type: String,
            required: true,
            enum: ["Video", "Tweet"], // Specifies valid entity types
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

export const Comment = mongoose.model("Comment", commentSchema);
