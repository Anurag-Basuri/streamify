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
router.post('/', addHistory);

// Update an existing history entry
router.put('/:historyId', updateHistory);

// Delete a history entry
router.delete('/:historyId', deleteHistory);

// Export the router
export default router;