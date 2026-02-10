/**
 * Streamify Backend Server Entry Point
 * Handles server initialization, database connection, and graceful shutdown
 */
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import connectDB from "./database/index.js";
import { verifyCloudinaryConnection } from "./utils/cloudinary.js";
import { verifyEmailConnection } from "./utils/email.js";
import { setSocketIO } from "./utils/notifications.js";
import { initRedis, closeRedis } from "./infrastructure/redis.js";
import { initQueues, closeQueues } from "./queues/index.js";

// Configuration
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Server instance references for graceful shutdown
let server = null;
let io = null;

/**
 * Validates required environment variables
 */
const validateEnvironment = () => {
    const required = [
        "MONGODB_URL",
        "DB_NAME",
        "ACCESS_TOKEN_SECRET",
        "REFRESH_TOKEN_SECRET",
        "CLOUD_NAME",
        "API_KEY",
        "API_SECRET",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Missing required environment variables:");
        missing.forEach((key) => console.error(`   - ${key}`));
        process.exit(1);
    }

    console.log("✅ Environment variables validated");
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

    // Close Socket.io connections
    if (io) {
        io.close(() => {
            console.log("✅ Socket.io connections closed");
        });
    }

    // Stop accepting new connections
    if (server) {
        server.close(() => {
            console.log("✅ HTTP server closed");
        });
    }

    // Close database connection
    try {
        const mongoose = await import("mongoose");
        await mongoose.default.connection.close();
        console.log("✅ MongoDB connection closed");
    } catch (error) {
        console.error("❌ Error closing MongoDB connection:", error.message);
    }

    // Close background workers/queues
    try {
        await closeQueues();
        console.log("✅ Queues closed");
    } catch (error) {
        console.error("❌ Error closing queues:", error.message);
    }

    // Close Redis connection
    try {
        await closeRedis();
        console.log("✅ Redis connection closed");
    } catch (error) {
        console.error("❌ Error closing Redis:", error.message);
    }

    console.log("👋 Graceful shutdown complete");
    process.exit(0);
};

/**
 * Starts the server
 */
const startServer = async () => {
    try {
        console.log("\n🚀 Starting Streamify Server...\n");
        console.log(`📍 Environment: ${NODE_ENV}`);

        // Step 1: Validate environment
        validateEnvironment();

        // Step 2: Connect to MongoDB
        await connectDB();

        // Step 2b: Connect to Redis (optional)
        await initRedis().catch((err) => {
            console.warn("⚠️ Redis connection failed:", err?.message || err);
        });

        // Step 2c: Initialize background queues/workers (optional, requires Redis)
        initQueues();

        // Step 3: Verify Cloudinary connection (non-blocking)
        verifyCloudinaryConnection().catch((err) => {
            console.warn("⚠️ Cloudinary verification failed:", err.message);
        });

        // Step 4: Verify Email connection (non-blocking, optional)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            verifyEmailConnection().catch((err) => {
                console.warn("⚠️ Email verification failed:", err.message);
            });
        }

        // Step 5: Start HTTP server with Socket.io
        const httpServer = createServer(app);

        // Configure Socket.io
        const allowedOrigins = (
            process.env.CORS_ORIGIN || "http://localhost:5173"
        )
            .split(",")
            .map((origin) => origin.trim());

        io = new Server(httpServer, {
            cors: {
                origin: allowedOrigins,
                credentials: true,
                methods: ["GET", "POST"],
            },
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        // Set Socket.io instance for notifications utility
        setSocketIO(io);

        // Socket.io connection handler
        io.on("connection", (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);

            // Join user-specific room for notifications
            socket.on("user:join", (userId) => {
                if (userId) {
                    socket.join(`user:${userId}`);
                    console.log(`👤 User ${userId} joined notification room`);
                }
            });

            // Leave user room
            socket.on("user:leave", (userId) => {
                if (userId) {
                    socket.leave(`user:${userId}`);
                    console.log(`👤 User ${userId} left notification room`);
                }
            });

            socket.on("disconnect", (reason) => {
                console.log(`🔌 Client disconnected: ${socket.id} - ${reason}`);
            });
        });

        server = httpServer.listen(PORT, () => {
            console.log(`\n⚙️  Server is running at http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API Base: http://localhost:${PORT}/api/v1`);
            console.log(`🔌 Socket.io ready for real-time notifications\n`);
        });

        // Handle server errors
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`❌ Port ${PORT} is already in use`);
            } else {
                console.error("❌ Server error:", error.message);
            }
            process.exit(1);
        });

        // Step 6: Setup graceful shutdown handlers
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

        // Handle uncaught exceptions
        process.on("uncaughtException", (error) => {
            console.error("❌ Uncaught Exception:", error);
            gracefulShutdown("uncaughtException");
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (reason, promise) => {
            console.error(
                "❌ Unhandled Rejection at:",
                promise,
                "reason:",
                reason
            );
            gracefulShutdown("unhandledRejection");
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

// Start the server
startServer();
