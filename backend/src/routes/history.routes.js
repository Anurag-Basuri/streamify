import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
    addVideoToHistory,
    getUserHistory,
    removeVideoFromHistory,
    removeMultipleFromHistory,
    clearUserHistory,
    getHistoryStats,
} from "../controllers/history.controller.js";

const router = express.Router();

// All history routes require authentication
router.use(requireAuth);

// Get user's history (with pagination and search)
// Query params: page, limit, search
router.get("/", getUserHistory);

// Get history statistics
router.get("/stats", getHistoryStats);

// Add video to history
router.post("/add/:videoId", addVideoToHistory);

// Remove specific video from history
router.delete("/:videoId", removeVideoFromHistory);

// Remove multiple videos from history
router.delete("/batch", removeMultipleFromHistory);

// Clear all history
router.delete("/", clearUserHistory);

export default router;
