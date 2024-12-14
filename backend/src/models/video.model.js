import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: [true, "Video is required"],
            match: [
                /^(https?:\/\/.*\.(?:mp4|mov|avi|flv|mkv))$/i,
                "Invalid URL format for video file",
            ],
        },
        thumbnail: {
            type: String,
            required: [true, "Thumbnail is required"],
            match: [
                /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i,
                "Invalid URL format for thumbnail",
            ],
        },
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        tags: {
            type: [String],
            default: [],
        },
        slug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.index({ owner: 1, isPublished: 1 });
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
