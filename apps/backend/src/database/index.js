/**
 * MongoDB Database Connection Module
 * Handles database connection with retry logic and connection monitoring
 */
import mongoose from "mongoose";

// Connection configuration
const DB_CONFIG = {
    maxRetries: 5,
    retryDelay: 5000, // 5 seconds
    connectionOptions: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    },
};

/**
 * Connects to MongoDB with retry logic
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<void>}
 */
const connectDB = async (retryCount = 0) => {
    const MONGODB_URL = process.env.MONGODB_URL;
    const DB_NAME = process.env.DB_NAME;

    if (!MONGODB_URL || !DB_NAME) {
        console.error("❌ MongoDB URL or DB_NAME not configured");
        process.exit(1);
    }

    const connectionString = `${MONGODB_URL}/${DB_NAME}`;

    try {
        const connection = await mongoose.connect(
            connectionString,
            DB_CONFIG.connectionOptions
        );

        console.log(`✅ MongoDB connected`);
        console.log(`   Host: ${connection.connection.host}`);
        console.log(`   Database: ${connection.connection.name}`);

        // Setup connection event handlers
        setupConnectionHandlers();

        return connection;
    } catch (error) {
        console.error(
            `❌ MongoDB connection attempt ${retryCount + 1} failed:`,
            error.message
        );

        if (retryCount < DB_CONFIG.maxRetries) {
            console.log(
                `🔄 Retrying in ${DB_CONFIG.retryDelay / 1000} seconds...`
            );
            await new Promise((resolve) =>
                setTimeout(resolve, DB_CONFIG.retryDelay)
            );
            return connectDB(retryCount + 1);
        }

        console.error("❌ Max retries reached. Exiting...");
        process.exit(1);
    }
};

/**
 * Setup MongoDB connection event handlers
 */
const setupConnectionHandlers = () => {
    mongoose.connection.on("connected", () => {
        console.log("📗 MongoDB connection established");
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("📙 MongoDB connection disconnected");
    });

    mongoose.connection.on("error", (error) => {
        console.error("📕 MongoDB connection error:", error.message);
    });

    mongoose.connection.on("reconnected", () => {
        console.log("📗 MongoDB reconnected");
    });
};

/**
 * Gracefully close the database connection
 * @returns {Promise<void>}
 */
export const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("✅ MongoDB connection closed gracefully");
    } catch (error) {
        console.error("❌ Error closing MongoDB connection:", error.message);
        throw error;
    }
};

/**
 * Check if database is connected
 * @returns {boolean}
 */
export const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

/**
 * Get database connection status
 * @returns {Object}
 */
export const getConnectionStatus = () => {
    const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };

    return {
        status: states[mongoose.connection.readyState] || "unknown",
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
    };
};

export default connectDB;
