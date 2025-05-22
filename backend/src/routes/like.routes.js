// like.routes.js
import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    getLikedEntities,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controller.js";

const router = express.Router();

router.use(verifyAccessToken);

// Match exactly the endpoints used in the frontend
router.post("/toggle/video/:videoId", toggleVideoLike);
router.post("/toggle/comment/:commentId", toggleCommentLike);
router.post("/toggle/tweet/:tweetId", toggleTweetLike);

router.get("/filter", getLikedEntities); // Fetch liked entities filtered by type (query: entityType=Video/Comment/Tweet)

export default router;
