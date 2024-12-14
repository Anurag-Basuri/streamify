import express from "express";
import {
    toggleSubscription,
    getSubscribedChannel,
    getUserSubscribed,
} from "../controllers/subscription.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toggle subscription (subscribe/unsubscribe)
router.post("/:channelId/toggle", verifyAccessToken, toggleSubscription);

// Get all channels subscribed by the authenticated user
router.get("/subscribed-channels", verifyAccessToken, getSubscribedChannel);

// Get all subscribers of a specific channel
router.get("/:channelId/subscribers", verifyAccessToken, getUserSubscribed);

export default router;
