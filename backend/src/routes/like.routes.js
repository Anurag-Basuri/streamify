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

router.post("/video/:videoId", toggleVideoLike);
router.post("/tweet/:tweetId", toggleTweetLike);
router.post("/comment/:commentId", toggleCommentLike);

router.get("/filter", getLikedEntities); // Fetch liked entities filtered by type (query: entityType=Video/Comment/Tweet)

export default router;
