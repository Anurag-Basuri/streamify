import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import {
    addVideoToHistory,
    getUserHistory,
    removeVideoFromHistory,
    clearUserHistory,
} from '../controllers/history.controller.js';

const router = express.Router();

router.use(verifyAccessToken);

// Get user's history
router.get("/", getUserHistory);

// Add video to history
router.post("/add/:videoId", addVideoToHistory);

// Remove video from history
router.delete("/:videoId", removeVideoFromHistory);

// Clear all history
router.delete("/clear", clearUserHistory);

// Export the router
export default router;