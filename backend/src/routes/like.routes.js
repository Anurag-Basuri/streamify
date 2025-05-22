import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    getLikedEntities,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getUserLikedVideos,
} from "../controllers/like.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyAccessToken);

// Toggle like routes - these match exactly what the frontend expects
router.post("/toggle/video/:videoId", toggleVideoLike);
router.post("/toggle/comment/:commentId", toggleCommentLike);
router.post("/toggle/tweet/:tweetId", toggleTweetLike);

// Get liked entities
router.get("/filter", getLikedEntities); // Query param: entityType=Video/Comment/Tweet
router.get("/videos", getUserLikedVideos); // Get user's liked videos with pagination

export default router;
