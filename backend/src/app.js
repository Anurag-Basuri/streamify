import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { v2 as cloudinary } from "cloudinary";

// ✅ Load environment variables
dotenv.config();

// ✅ Import route files
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import watchLaterRouter from "./routes/watchlater.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// ✅ Initialize Passport Config
import "./config/passport.js";

const app = express();

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// ✅ Trust Proxy (for OAuth in production)
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// ✅ Session Middleware (Before passport.session())
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret", // Separate from JWT secret
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Secure cookies in production
            httpOnly: true, // Prevent client-side access
            maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Needed for third-party OAuth
        },
    })
);

// ✅ Initialize Passport (After session middleware)
app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL, // Ensure frontend URL is correct for OAuth
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Routes
app.use("/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/watchlater", watchLaterRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };
