import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    addVideoToWatchLater,
    removeVideoFromWatchLater,
    getWatchLaterVideos,
    clearWatchLater,
    getWatchLaterStats,
    updateVideoReminder,
} from "../controllers/watchlater.controller.js";

const router = express.Router();

router.use(verifyAccessToken);

router.get("/", getWatchLaterVideos);
router.post("/:videoId", addVideoToWatchLater);
router.delete("/:videoId", removeVideoFromWatchLater);
router.delete("/clear", clearWatchLater);
router.get("/stats", getWatchLaterStats);
router.patch("/:videoId/reminder", updateVideoReminder);

export default router;
