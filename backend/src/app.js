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

const app = express();

// Add your middleware, routes, etc. here
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // Use cookieParser

// Use the routes with appropriate prefixes
// For example, user-related routes will be accessed via /api/v1/users, video-related via /api/v1/videos, etc.
app.use("/api/v1/users", userRouter); // User routes
app.use("/api/v1/videos", videoRouter); // Video routes
app.use("/api/v1/tweets", tweetRouter); // Tweet routes
app.use("/api/v1/comments", commentRouter); // Comment routes
app.use("/api/v1/likes", likeRouter); // Like routes
app.use("/api/v1/playlists", playlistRouter); // Playlist routes
app.use("/api/v1/watchlater", watchLaterRouter); // Watch later routes
app.use("/api/v1/subscriptions", subscriptionRouter); // Subscription routes
app.use("/api/v1/dashboard", dashboardRouter); // Dashboard routes

export { app };
