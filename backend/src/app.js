import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import session from "express-session";
import passport from "passport";
import "./config/passport.js"; // Ensure the file containing Google strategy is imported

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

dotenv.config();
const app = express();
app.use(passport.initialize());
app.use(passport.session());

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/watchlater", watchLaterRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.NODE_ENV === "production" },
    })
);

export { app };