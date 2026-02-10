import { APIerror } from "../utils/APIerror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**
 * Lenient auth middleware - allows unauthenticated requests to proceed
 * Use for routes that work with or without authentication
 */
const verifyAccessToken = asynchandler(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const user = await verifyAndGetUser(token);
        req.user = user;
        next();
    } catch (error) {
        // For lenient middleware, just set user to null on error
        req.user = null;
        next();
    }
});

/**
 * Strict auth middleware - requires valid authentication
 * Use for protected routes that require a logged-in user
 */
const requireAuth = asynchandler(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        throw new APIerror(401, "Access token is required");
    }

    try {
        const user = await verifyAndGetUser(token);
        req.user = user;
        next();
    } catch (error) {
        throw new APIerror(
            401,
            error.message || "Invalid or expired access token"
        );
    }
});

/**
 * Extract token from request (cookies or Authorization header)
 */
function extractToken(req) {
    // Check cookies first
    if (req.cookies?.accessToken) {
        return req.cookies.accessToken;
    }

    // Check Authorization header
    const authHeader = req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    return null;
}

/**
 * Verify token and return user
 * Supports both `_id` and `id` JWT payload formats for backwards compatibility
 */
async function verifyAndGetUser(token) {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Support both _id and id for backwards compatibility
    const userId = decodedToken._id || decodedToken.id;

    if (!userId) {
        throw new APIerror(401, "Invalid token payload");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new APIerror(401, "User not found");
    }

    return user;
}

export { verifyAccessToken, requireAuth };