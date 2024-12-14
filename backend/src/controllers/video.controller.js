import { asynchandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
// Increment video views with rate limiting
import rateLimit from "express-rate-limit";

// Create a new video
const create_new_video = asynchandler(async (req, res) => {
    const { title, description, duration, tags } = req.body;
    const videoFile = req.files?.videoFile;
    const thumbnail = req.files?.thumbnail;

    if (!thumbnail || !videoFile) {
        throw new APIerror(400, "Video file and thumbnail are required");
    }

    if (!title || title.length < 5 || title.length > 100) {
        throw new APIerror(400, "Title must be between 5 and 100 characters");
    }

    const videoUpload = await uploadOnCloudinary(videoFile).catch((err) => {
        throw new APIerror(500, "Failed to upload video to Cloudinary");
    });

    const thumbnailUpload = await uploadOnCloudinary(thumbnail).catch((err) => {
        throw new APIerror(500, "Failed to upload thumbnail to Cloudinary");
    });

    const video = await Video.create({
        title,
        description,
        duration,
        tags: Array.isArray(tags) ? tags : [],
        videoFile: videoUpload,
        thumbnail: thumbnailUpload,
        owner: req.user._id,
    });

    return res
        .status(200)
        .json(new APIresponse(200, video, "Video uploaded successfully"));
});

// Fetch all videos (with optional filters)
const get_videos = asynchandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
        search,
        isPublished,
    } = req.query;

    const match = { isDeleted: false }; // Exclude deleted videos

    if (userId) {
        match.owner = mongoose.Types.ObjectId(userId);
    }

    if (search) {
        match.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    if (isPublished !== undefined) {
        match.isPublished = isPublished === "true";
    }

    if (query) {
        try {
            const additionalFilters = JSON.parse(query);
            Object.assign(match, additionalFilters);
        } catch (err) {
            throw new APIerror(400, "Invalid query parameter format");
        }
    }

    const videos = await Video.aggregate([
        { $match: match },
        { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } },
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

// Get a single video using ID
const get_video_by_id = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid Video Id");
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

    // Validate videoID
    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid video ID");
    }

    // Validate fields in req.body
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (tags) {
        if (!Array.isArray(tags)) {
            throw new APIerror(400, "Tags must be an array of strings");
        }
        updateFields.tags = tags;
    }

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
        throw new APIerror(400, "No valid fields provided for update");
    }

    // Update video and validate existence
    const video = await Video.findByIdAndUpdate(videoID, updateFields, {
        new: true,
        runValidators: true,
    });

    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    // Send success response
    return res
        .status(200)
        .json(new APIresponse(200, video, "Video successfully updated"));
});

// Delete a video(soft delete)
const delete_video = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid video Id");
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
        .json(new APIresponse(200, null, "Video successfully deleted"));
});

// Toggle video publish status
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
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

// Create a rate limiter middleware
const videoRateLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later.", // Custom error message
});

// Increment video views with rate limiting
const incrementVideoViews = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }

    const video = await Video.findOneAndUpdate(
        { _id: videoId, isDeleted: false },
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!video) {
        throw new APIerror(404, "Video not found or has been deleted");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video view incremented successfully")
        );
});

// Apply the rate limiter middleware to the increment views route
incrementVideoViews.rateLimiter = videoRateLimiter;

export {
    create_new_video,
    get_videos,
    get_video_by_id,
    update_video,
    delete_video,
    togglePublishStatus,
    incrementVideoViews,
};
