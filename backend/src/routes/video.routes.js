import Router from "express";
import { body, param } from "express-validator";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js"; // Import access token middleware
import {
    create_new_video,
    get_videos,
    get_video_by_id,
    update_video,
    delete_video,
    togglePublishStatus,
    incrementVideoViews,
    getRandomVideos,
} from "../controllers/video.controller.js";
import { validateResult } from "../middlewares/validate.middleware.js";

const router = Router();

// Apply verifyAccessToken middleware to all routes
router.use(verifyAccessToken);

// Validation rules for creating a video
const createVideoRules = [
    body("title")
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description")
        .notEmpty()
        .withMessage("Description should not be empty"),
    body("duration").isNumeric().withMessage("Duration must be a valid number"),
];

// Route to upload a new video
router.route("/upload").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 }, // Ensure maxCount is appropriate
        { name: "thumbnail", maxCount: 1 },
    ]),
    createVideoRules,
    validateResult,
    create_new_video
);

// Route to fetch all videos (no validation required for query parameters)
router.get("/", get_videos);

// Route to fetch a single video by ID
router
    .route("/:videoID")
    .get(
        param("videoID").isMongoId().withMessage("Invalid video ID"),
        validateResult,
        get_video_by_id
    );

// Route to update a video
router.patch(
    "/:videoID",
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    body("title")
        .optional()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description").optional().isString(),
    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array of strings"),
    validateResult,
    update_video
);

// Route to delete a video
router.delete(
    "/:videoID",
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    delete_video
);

// Route to toggle publish status of a video
router.patch(
    "/:videoID/publish",
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    togglePublishStatus
);

// Route to increment video views
router.patch(
    "/:videoID/views",
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    incrementVideoViews
);

router.get("/home", getRandomVideos);

export default router;
