import { asynchandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs";
import { compressVideo } from "../middlewares/multer.middleware.js";

// Create a new video
const create_new_video = asynchandler(async (req, res) => {
    try {
        const videoFile = req.files?.videoFile?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        // Validate files
        if (!videoFile || !thumbnail) {
            throw new APIerror(400, "Both video and thumbnail are required");
        }

        // File path validation
        if (!fs.existsSync(videoFile.path) || !fs.existsSync(thumbnail.path)) {
            throw new APIerror(400, "Uploaded files not found");
        }

        // Process video
        const compressedPath = `../../public/compressed_${Date.now()}_${videoFile.filename}`;
        await compressVideo(videoFile.path, compressedPath);

        // Upload to Cloudinary
        const [videoUpload, thumbnailUpload] = await Promise.all([
            uploadOnCloudinary(compressedPath),
            uploadOnCloudinary(thumbnail.path),
        ]);

        // Create video document
        const video = await Video.create({
            title: req.body.title,
            description: req.body.description,
            duration: videoUpload.duration,
            tags: JSON.parse(req.body.tags || "[]"),
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

        // Cleanup files
        [videoFile.path, thumbnail.path, compressedPath].forEach((path) => {
            fs.existsSync(path) && fs.unlinkSync(path);
        });

        return res
            .status(201)
            .json(new APIresponse(201, video, "Video uploaded successfully"));
    } catch (error) {
        // Cleanup on error
        [
            req.files?.videoFile?.[0]?.path,
            req.files?.thumbnail?.[0]?.path,
            compressedPath,
        ].forEach((path) => {
            path && fs.existsSync(path) && fs.unlinkSync(path);
        });

        // Handle specific errors
        if (error.code === 11000) {
            throw new APIerror(400, "Duplicate video entry detected");
        }
        throw error;
    }
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

// Update video details
const update_video = asynchandler(async (req, res) => {
    const { videoID } = req.params;
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
    const updates = {};

    // Validate video ID
    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid Video ID");
    }

    // Validate video ownership
    const video = await Video.findById(videoID).populate("owner");
    if (!video) {
        throw new APIerror(404, "Video not found");
    }
    if (video.owner._id.toString() !== req.user._id.toString()) {
        throw new APIerror(403, "Unauthorized to update this video");
    }

    // Process updates
    if (req.body.title) {
        updates.title = req.body.title;
    }
    if (req.body.description) {
        updates.description = req.body.description;
    }
    if (req.body.tags) {
        try {
            updates.tags = JSON.parse(req.body.tags);
        } catch (err) {
            throw new APIerror(400, "Invalid tags format");
        }
    }

    // Handle thumbnail update
    if (req.files?.thumbnail?.[0]) {
        try {
            const thumbnail = await uploadOnCloudinary(
                req.files.thumbnail[0].path
            );
            updates.thumbnail = {
                url: thumbnail.secure_url,
                publicId: thumbnail.public_id,
            };
            fs.unlinkSync(req.files.thumbnail[0].path);
        } catch (err) {
            throw new APIerror(500, "Failed to upload thumbnail");
        }
    }

    // Check if updates object is empty
    if (Object.keys(updates).length === 0) {
        throw new APIerror(400, "No fields provided for update");
    }

    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(videoID, updates, {
        new: true,
        runValidators: true,
    });

    if (!updatedVideo) {
        throw new APIerror(404, "Video not found");
    }

    return res
        .status(200)
        .json(new APIresponse(200, updatedVideo, "Video updated successfully"));
});

// Delete video (soft delete)
const delete_video = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    // Validate video ID
    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid Video ID");
    }

    // Find the video
    const video = await Video.findById(videoID);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    // Validate ownership
    if (!video.owner.equals(req.user._id)) {
        throw new APIerror(403, "Unauthorized to delete this video");
    }

    // Perform soft delete
    video.isDeleted = true;
    await video.save();

    return res
        .status(200)
        .json(new APIresponse(200, video, "Video marked as deleted"));
});

// Toggle publish status
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    // Validate video ownership
    const video = await Video.findById(videoID);
    if (!video.owner.equals(req.user._id)) {
        throw new APIerror(403, "Unauthorized to update this video");
    }

    // Toggle the publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoID,
        { $set: { isPublished: !video.isPublished } },
        { new: true, runValidators: true }
    );

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                updatedVideo,
                `Video ${updatedVideo.isPublished ? "published" : "unpublished"}`
            )
        );
});

// Get random videos
const getRandomVideos = asynchandler(async (req, res) => {
    const videos = await Video.aggregate([
        { $match: { isPublished: true } },
        { $sample: { size: 10 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            avatar: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: "$owner" },
    ]);

    if (!videos.length) {
        throw new APIerror(404, "No videos found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { videos },
                "Random videos fetched successfully"
            )
        );
});

// Increment in views
const incrementViewCount = asynchandler(async (req, res) => {
    const { videoID } = req.params;

    if (!mongoose.isValidObjectId(videoID)) {
        throw new APIerror(400, "Invalid Video ID");
    }

    const video = await Video.findByIdAndUpdate(
        videoID,
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { views: video.views },
                "View count incremented"
            )
        );
});

// Get user videos
const get_User_Videos = asynchandler(async (req, res) => {
    const { sort = "newest", search = "" } = req.query;

    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        views: { views: -1 },
    };

    const videos = await Video.find({
        owner: req.user._id,
        isDeleted: false, // Exclude soft-deleted videos
        title: { $regex: search, $options: "i" },
    })
        .sort(sortOptions[sort] || sortOptions.newest)
        .populate("owner", "username");

    res.status(200).json(new APIresponse(200, { videos }, "Videos fetched"));
});

export {
    create_new_video,
    get_video_by_id,
    update_video,
    delete_video,
    togglePublishStatus,
    getRandomVideos,
    incrementViewCount,
    get_User_Videos,
};