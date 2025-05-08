import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

// Protect the route with authentication middleware
router.use(verifyAccessToken);

// Route to get dashboard data
router.get("/", getDashboard);

// Handle invalid routes under /dashboard
router.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

export default router;
