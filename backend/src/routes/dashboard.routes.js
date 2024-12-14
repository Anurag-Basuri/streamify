import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

// Protect the route with authentication middleware
router.use(verifyAccessToken);

// Route to get dashboard data
router.get("/", getDashboard);

export default router;
