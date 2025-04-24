import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    addVideoToWatchLater,
    removeVideoFromWatchLater,
    getWatchLaterVideos,
} from "../controllers/watchlater.controller.js";

const router = express.Router();

router.use(verifyAccessToken);

router.get("/", getWatchLaterVideos);
router.post("/:videoId", addVideoToWatchLater);
router.delete("/:videoId", removeVideoFromWatchLater);

export default router;
