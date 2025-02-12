import cookieParser from "cookie-parser"; // Import cookie-parser
import cors from "cors";
import express from "express";

// Import all route files
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import watchLaterRouter from "./routes/watchlater.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

const api = express();

// Add your middleware, routes, etc. here
api.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

api.use(express.json({ limit: "20kb" }));
api.use(express.urlencoded({ extended: true, limit: "20kb" }));
api.use(express.static("public"));
api.use(cookieParser()); // Use cookieParser

// Use the routes with apiropriate prefixes
// For example, user-related routes will be accessed via /api/v1/users, video-related via /api/v1/videos, etc.
api.use("/api/v1/users", userRouter); // User routes
api.use("/api/v1/videos", videoRouter); // Video routes
api.use("/api/v1/tweets", tweetRouter); // Tweet routes
api.use("/api/v1/comments", commentRouter); // Comment routes
api.use("/api/v1/likes", likeRouter); // Like routes
api.use("/api/v1/playlists", playlistRouter); // Playlist routes
api.use("/api/v1/watchlater", watchLaterRouter); // Watch later routes
api.use("/api/v1/subscriptions", subscriptionRouter); // Subscription routes
api.use("/api/v1/dashboard", dashboardRouter); // Dashboard routes

export { api };
