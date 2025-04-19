import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import {
    getHistory,
    getHistoryById,
    addHistory,
    updateHistory,
    deleteHistory,
} from '../controllers/history.controller.js';

const router = express.Router();

router.use(verifyAccessToken);

// Get all history for the authenticated user
router.get('/', getHistory);

// Get a specific history by ID
router.get('/:historyId', getHistoryById);

// Add a new history entry
router.post("/add", addHistory);

// Update an existing history entry
router.put("/update/:historyId", updateHistory);

// Delete a history entry
router.delete("/delete/:historyId", deleteHistory);

// Export the router
export default router;