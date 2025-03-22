import Router from "express";
import { body, param } from "express-validator";
import { uploadFields } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    create_new_video,
    get_videos,
    get_video_by_id,
    update_video,
    delete_video,
    togglePublishStatus,
    getRandomVideos,
    incrementViewCount,
} from "../controllers/video.controller.js";
import { validateResult } from "../middlewares/validate.middleware.js";

const router = Router();

// Public route
router.get("/home", getRandomVideos);

// Route to fetch a single video by ID
router
    .route("/:videoID")
    .get(
        param("videoID").isMongoId().withMessage("Invalid video ID"),
        validateResult,
        get_video_by_id
    );

// Route to increment views
router
    .route("/:videoID/view")
    .post(
        param("videoID").isMongoId().withMessage("Invalid video ID"),
        validateResult,
        incrementViewCount
    );

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
    body("tags").notEmpty().withMessage("Tags should not be empty"),
];

// Route to upload the video
router.route("/upload").post(
    (req, res, next) => {
        console.log("Upload route hit");
        next();
    },
    uploadFields,
    (req, res, next) => {
        console.log("Files uploaded to server:", req.files);
        next();
    },
    createVideoRules,
    validateResult,
    create_new_video
);

// Route to fetch all videos
router.get("/", get_videos);

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

// Route to toggle publish status
router.patch(
    "/:videoID/publish",
    param("videoID").isMongoId().withMessage("Invalid video ID"),
    validateResult,
    togglePublishStatus
);

export default router;