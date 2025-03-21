import { asynchandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs";

// Create a new video
const create_new_video = asynchandler(async (req, res) => {
    console.log("Finally!!!!!!!!");
    try {
        // Get files from Multer
        const videoFile = req.files?.videoFile?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        // Validate required fields
        if (!videoFile || !thumbnail) {
            throw new APIerror(400, "Both video and thumbnail are required");
        }

        // Validate file types
        if (!videoFile.mimetype.startsWith("video/")) {
            throw new APIerror(400, "Invalid video file type");
        }
        if (!thumbnail.mimetype.startsWith("image/")) {
            throw new APIerror(400, "Invalid thumbnail format");
        }

        // Get local file paths
        const videoPath = videoFile.path;
        const thumbnailPath = thumbnail.path;

        // Upload to Cloudinary
        const [videoUpload, thumbnailUpload] = await Promise.all([
            uploadOnCloudinary(videoPath),
            uploadOnCloudinary(thumbnailPath),
        ]);

        // Cleanup temporary files
        fs.unlinkSync(videoPath);
        fs.unlinkSync(thumbnailPath);

        // Create video document
        const video = await Video.create({
            title: req.body.title,
            description: req.body.description,
            duration: videoUpload.duration,
            tags: JSON.parse(req.body.tags),
            videoFile: {
                url: videoUpload.secure_url,
                publicId: videoUpload.public_id,
            },
            thumbnail: {
                url: thumbnailUpload.secure_url,
                publicId: thumbnailUpload.public_id,
            },
            owner: req.user._id,
        });

        return res
            .status(201)
            .json(new APIresponse(201, video, "Video uploaded successfully"));
    } catch (error) {
        // Cleanup files even if error occurs
        if (videoFile?.path && fs.existsSync(videoFile.path)) {
            fs.unlinkSync(videoFile.path);
        }
        if (thumbnail?.path && fs.existsSync(thumbnail.path)) {
            fs.unlinkSync(thumbnail.path);
        }
        throw error;
    }
});

// Fetch all videos
const get_videos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, search, userId } = req.query;
    const match = { isDeleted: false };

    if (userId) {
        match.owner = mongoose.Types.ObjectId(userId);
    }

    if (search) {
        match.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const videos = await Video.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: +limit },
    ]);

    const totalVideos = await Video.countDocuments(match);

    return res.status(200).json(
        new APIresponse(
            200,
            {
                videos,
                pagination: {
                    currentPage: +page,
                    totalPages: Math.ceil(totalVideos / limit),
                    totalVideos,
                },
            },
            "Videos fetched successfully"
        )
    );
});

// Get a single video by ID
const get_video_by_id = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoID).populate(
        "owner",
        "userName fullName avatar"
    );

    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video details fetched successfully")
        );
});

// Update a video
const update_video = asynchandler(async (req, res) => {
    const { videoID } = req.params;
    const { title, description, tags } = req.body;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (tags) updateFields.tags = JSON.parse(tags);

    const video = await Video.findByIdAndUpdate(videoID, updateFields, {
        new: true,
    });

    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    return res
        .status(200)
        .json(new APIresponse(200, video, "Video updated successfully"));
});

// Delete a video (soft delete)
const delete_video = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndUpdate(
        videoID,
        { isDeleted: true },
        { new: true }
    );

    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    return res
        .status(200)
        .json(new APIresponse(200, null, "Video deleted successfully"));
});

// Toggle publish status
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoID);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                video,
                `Video ${video.isPublished ? "published" : "unpublished"} successfully`
            )
        );
});

// Get random videos
const getRandomVideos = asynchandler(async (req, res) => {
    const videos = await Video.aggregate([{ $sample: { size: 10 } }]);

    if (!videos.length) {
        throw new APIerror(404, "No videos found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, videos, "Random videos fetched successfully")
        );
});

export {
    create_new_video,
    get_videos,
    get_video_by_id,
    update_video,
    delete_video,
    togglePublishStatus,
    getRandomVideos,
};