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

// Get all history for the authenticated user
router.get("/", getUserHistory);

// Add a new history entry
router.post("/add/:videoId", addVideoToHistory);

// Update an existing history entry
router.put("/update/:historyId", removeVideoFromHistory);

// Delete a history entry
router.delete("/delete/:historyId", clearUserHistory);

// Export the router
export default router;