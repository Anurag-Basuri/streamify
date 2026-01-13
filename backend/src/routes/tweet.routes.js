import express from "express";
import {
    verifyAccessToken,
    requireAuth,
} from "../middlewares/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    get_user_tweet,
    updateTweet,
    get_latest_tweets,
} from "../controllers/tweet.controller.js";
import { validateResult } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Get the latest tweets (public, verifyAccessToken is lenient - sets req.user if token exists)
router.get("/", verifyAccessToken, get_latest_tweets);

// Protected routes below - requireAuth is strict, requires valid token
router.use(requireAuth);

// Create a new tweet
router.post("/create", validateResult, createTweet);

// Get tweets of a specific user
router.get("/:userId", get_user_tweet);

// Update a specific tweet
router.put("/:tweetId", updateTweet);

// Delete a specific tweet
router.delete("/:tweetId", deleteTweet);

export default router;
