import { asynchandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
// Increment video views with rate limiting
import rateLimit from "express-rate-limit";

// Create a new video
const create_new_video = asynchandler(async (req, res) => {
    const { title, description, duration, tags } = req.body;

    // Get files from Multer
    const videoFile = req.files?.videoFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    // Validate required fields
    if (!videoFile || !thumbnail) {
        throw new APIerror(400, "Both video and thumbnail are required");
    }

    // Validate file types
    const videoMimeType = videoFile.mimetype.startsWith("video/");
    const imageMimeType = thumbnail.mimetype.startsWith("image/");
    if (!videoMimeType || !imageMimeType) {
        throw new APIerror(400, "Invalid file format");
    }

    // Upload to Cloudinary with error handling
    const uploadFile = async (file, resourceType) => {
        try {
            return await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                {
                    resource_type: resourceType,
                    folder: "video-platform",
                    chunk_size: 6000000, // 6MB chunks for large files
                }
            );
        } catch (error) {
            console.error(`Cloudinary ${resourceType} upload error:`, error);
            throw new APIerror(500, `${resourceType} upload failed`);
        }
    };

    // Parallel uploads
    const [videoUpload, thumbnailUpload] = await Promise.all([
        uploadFile(videoFile, "video"),
        uploadFile(thumbnail, "image"),
    ]);

    // Create video document
    const video = await Video.create({
        title,
        description,
        duration: parseFloat(duration),
        tags: JSON.parse(tags),
        videoFile: {
            url: videoUpload.secure_url,
            publicId: videoUpload.public_id,
            duration: videoUpload.duration,
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

//get random videos for the user
const getRandomVideos = asynchandler(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the current page, default to 1
        const limit = 10; // Number of videos per request
        const skip = (page - 1) * limit; // Calculate the skip value

        const videos = await Video.aggregate([{ $sample: { size: limit } }])
            .skip(skip)
            .limit(limit);

        if (!videos || videos.length === 0) {
            return next(new APIerror(404, "No videos found"));
        }

        res.status(200).json(new APIresponse(200, videos, "Random videos fetched successfully"));
    } catch (error) {
        console.error("Error fetching random videos:", error);
        next(new APIerror(500, "Internal Server Error"));
    }
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
    getRandomVideos,
};
