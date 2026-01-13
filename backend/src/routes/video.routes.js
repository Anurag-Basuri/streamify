import Router from "express";
import { body, param, query } from "express-validator";
import { uploadFields } from "../middlewares/multer.middleware.js";
import {
    verifyAccessToken,
    requireAuth,
} from "../middlewares/auth.middleware.js";
import {
    createVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViewCount,
    getUserVideos,
    getAllVideos,
    generateDownloadUrl,
    getRecommendedVideos,
} from "../controllers/video.controller.js";
import { validateResult } from "../middlewares/validate.middleware.js";

const router = Router();

// ===========================================
// PUBLIC ROUTES (No authentication required)
// ===========================================

// Get all videos with pagination
router.get(
    "/",
    verifyAccessToken, // Optional auth for personalized data
    query("page").isInt({ min: 1 }).optional(),
    query("limit").isInt({ min: 1, max: 50 }).optional(),
    validateResult,
    getAllVideos
);

// Get recommended videos (based on current video's tags or trending)
router.get(
    "/recommendations/:videoId?",
    verifyAccessToken,
    getRecommendedVideos
);

// Get single video by ID (with optional auth for isLiked)
router.get(
    "/:videoID",
    verifyAccessToken, // Optional auth for isLiked
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    getVideoById
);

// Increment view count
router.post(
    "/:videoID/views",
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    incrementViewCount
);

// ===========================================
// PROTECTED ROUTES (Authentication required)
// ===========================================

// Validation rules for creating a video
const createVideoRules = [
    body("title")
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description").notEmpty().withMessage("Description is required"),
    body("tags").notEmpty().withMessage("Tags are required"),
];

// Upload new video
router.post(
    "/upload",
    requireAuth,
    uploadFields,
    createVideoRules,
    validateResult,
    createVideo
);

// Update video
router.patch(
    "/update/:videoID",
    requireAuth,
    uploadFields,
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    body("title")
        .optional()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description").optional().isString(),
    body("tags")
        .optional()
        .custom((value) => {
            if (typeof value === "string") {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        throw new Error("Tags must be an array of strings");
                    }
                    return true;
                } catch (err) {
                    throw new Error("Tags must be a valid JSON array");
                }
            } else if (!Array.isArray(value)) {
                throw new Error("Tags must be an array of strings");
            }
            return true;
        }),
    validateResult,
    updateVideo
);

// Delete video
router.delete(
    "/:videoID",
    requireAuth,
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    deleteVideo
);

// Toggle publish status
router.patch(
    "/:videoID/publish",
    requireAuth,
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    togglePublishStatus
);

// Get user's videos
router.get(
    "/user/:userID",
    requireAuth,
    param("userID").isMongoId().withMessage("Invalid user ID"),
    validateResult,
    getUserVideos
);

// Generate download URL
router.get(
    "/:videoID/download",
    requireAuth,
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    generateDownloadUrl
);

export default router;
