import { asynchandler } from "../utils/asynchandler";
import { APIerror } from "../ustils/APIerror";
import { APIresponse } from "../utils/APIresponse";
import { Video } from "../models/videos.model";
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import mongoose, { isValidObjectId } from "mongoose";

// create a new video
const create_new_video = asynchandler(async (req, res) => {
    const { title, description, duration, tags } = req.body;
    const videoFile = req.files?.videoFile;
    const thumbnail = req.files?.thumbnail;

    if (!thumbnail || !videoFile) {
        throw new APIerror(400, "Video file and thumbnail both are required");
    }

    const videoUpload = await uploadOnCloudinary(videoFile);
    const thumbnailUpload = await uploadOnCloudinary(thumbnail);

    const video = await Video.create({
        title,
        description,
        duration,
        tags,
        videoFile: videoUpload,
        thumbnail: thumbnailUpload,
        owner: req.user._id,
    });

    return res
        .status(200)
        .json(new APIresponse(200, video, "Video is successfully created"));
});

// Fetch all video(with optional filters)
const get_videos = asynchandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy,
        sortType,
        userId,
        search,
        isPublished,
    } = req.query;

    // Build the match filter
    const match = {};

    if (userId) {
        match.userId = userId;
    }

    if (search) {
        match.$or = [
            { title: { $regex: search, $options: "i" } }, // Case-insensitive title search
            { description: { $regex: search, $options: "i" } }, // Case-insensitive description search
        ];
    }

    if (isPublished !== undefined) {
        match.isPublished = isPublished === "true";
    }

    if (query) {
        try {
            const additionalFilters = JSON.parse(query);
            Object.assign(match, additionalFilters); // Add additional query filters
        } catch (err) {
            throw new APIerror(400, "Invalid query parameter format");
        }
    }

    // Fetch videos with aggregation
    const videos = await Video.aggregate([
        { $match: match }, // Apply filters
        { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } }, // Sorting
        { $skip: (page - 1) * limit }, // Pagination: Skip
        { $limit: +limit }, // Pagination: Limit
    ]);

    // Count total videos for pagination metadata
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
