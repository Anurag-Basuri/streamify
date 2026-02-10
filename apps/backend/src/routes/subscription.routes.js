import express from "express";
import {
    toggleSubscription,
    getSubscribedChannel,
    getUserSubscribed,
    checkSubscription,
} from "../controllers/subscription.controller.js";
import {
    requireAuth,
    verifyAccessToken,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toggle subscription (subscribe/unsubscribe)
router.post("/:channelId/toggle", requireAuth, toggleSubscription);

// Get all channels subscribed by the authenticated user
router.get("/subscribed-channels", requireAuth, getSubscribedChannel);

// Check subscription status for a channel (authenticated)
router.get("/check/:channelId", requireAuth, checkSubscription);

// Get all subscribers of a specific channel
router.get("/:channelId/subscribers", verifyAccessToken, getUserSubscribed);

export default router;
