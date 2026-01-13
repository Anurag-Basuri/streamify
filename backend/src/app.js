/**
 * Streamify Backend Application
 * Express application configuration with security, middleware, and routes
 */
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

// Import route files
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import watchLaterRouter from "./routes/watchlater.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import historyRouter from "./routes/history.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import activityRouter from "./routes/activity.routes.js";

// Import utilities
import { getConnectionStatus } from "./database/index.js";

const app = express();

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Trust Proxy (for reverse proxies in production)
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// Rate Limiting - Protect against brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 500, // More relaxed in dev
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health", // Don't rate limit health checks
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    message: {
        success: false,
        statusCode: 429,
        message: "Too many authentication attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Security Headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: process.env.NODE_ENV === "production",
    })
);

// ===========================================
// CORS CONFIGURATION
// ===========================================
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposedHeaders: ["X-Total-Count", "X-Page", "X-Limit"],
    })
);

// ===========================================
// BODY PARSING & COMPRESSION
// ===========================================

// Compression - Reduce response size
app.use(compression());

// Body Parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ===========================================
// SESSION MIDDLEWARE
// ===========================================
app.use(
    session({
        secret:
            process.env.SESSION_SECRET || "default_secret_change_in_production",
        resave: false,
        saveUninitialized: false,
        name: "streamify.sid", // Custom session cookie name
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
    })
);

// ===========================================
// REQUEST LOGGING (Development)
// ===========================================
if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            const status = res.statusCode;
            const color =
                status >= 500
                    ? "\x1b[31m"
                    : status >= 400
                      ? "\x1b[33m"
                      : "\x1b[32m";
            console.log(
                `${color}${req.method}\x1b[0m ${req.originalUrl} - ${status} (${duration}ms)`
            );
        });
        next();
    });
}

// ===========================================
// API ROUTES
// ===========================================

// Apply stricter rate limiting to auth routes
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);
app.use("/api/v1/users/forgot-password", authLimiter);

// Mount routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/watchlater", watchLaterRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/activity", activityRouter);

// ===========================================
// HEALTH & STATUS ENDPOINTS
// ===========================================

// Basic health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Detailed status (protected in production)
app.get("/status", (req, res) => {
    const dbStatus = getConnectionStatus();

    res.status(200).json({
        status: "OK",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: {
            used:
                Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
            total:
                Math.round(process.memoryUsage().heapTotal / 1024 / 1024) +
                "MB",
        },
        database: dbStatus,
    });
});

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    // Log error (with stack in development)
    console.error(`❌ Error: ${err.message}`);
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }

    // Handle specific error types
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    // Don't leak error details in production
    const response = {
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    };

    // Add stack trace in development
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
});

export { app };
