import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    get_user_tweet,
    updateTweet,
} from "../controllers/tweet.controller.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/createtweet", createTweet);

router.get("/:userId", get_user_tweet);

router.put("/:tweetId", updateTweet);

router.delete("/:tweetId", deleteTweet);

export default router;
