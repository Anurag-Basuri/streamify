import express from "express";
import {
    toggleFollow,
    checkFollow,
    getFollowers,
    getFollowing,
    getMyFollowing,
    getMyFollowers,
} from "../controllers/follow.controller.js";
import {
    requireAuth,
    verifyAccessToken,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================================
// AUTHENTICATED ROUTES (current user shortcuts)
// ============================================================================

// Get current user's following list
router.get("/following", requireAuth, getMyFollowing);

// Get current user's followers list
router.get("/followers", requireAuth, getMyFollowers);

// Toggle follow status (follow/unfollow a user)
router.post("/:userId/toggle", requireAuth, toggleFollow);

// Check if current user follows a specific user
router.get("/check/:userId", requireAuth, checkFollow);

// ============================================================================
// PUBLIC/SEMI-PUBLIC ROUTES (view any user's social graph)
// ============================================================================

// Get followers of a specific user
router.get("/:userId/followers", verifyAccessToken, getFollowers);

// Get following list of a specific user
router.get("/:userId/following", verifyAccessToken, getFollowing);

export default router;
