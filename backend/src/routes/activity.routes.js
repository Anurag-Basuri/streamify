import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
    getActivityLog,
    getActivitySummary,
    getActivityTypes,
    deleteActivity,
    clearActivityLog,
} from "../controllers/activity.controller.js";

const router = express.Router();

// All activity routes require authentication
router.use(requireAuth);

// Get activity log with pagination and filters
// Query params: page, limit, type, startDate, endDate
router.get("/", getActivityLog);

// Get activity summary/stats
// Query params: days (default 7)
router.get("/summary", getActivitySummary);

// Get available activity types
router.get("/types", getActivityTypes);

// Delete specific activity
router.delete("/:activityId", deleteActivity);

// Clear activity log (optionally by type)
// Query params: type (optional)
router.delete("/", clearActivityLog);

export default router;
