import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
    getDashboard,
    getChannelAnalytics,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(requireAuth);

// Get comprehensive dashboard data
router.get("/", getDashboard);

// Get detailed channel analytics
// Query params: days (default 30)
router.get("/analytics", getChannelAnalytics);

export default router;
