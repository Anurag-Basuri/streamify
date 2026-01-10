// Status Codes and Configuration Constants

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

// Pagination Defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
};

// Token Expiry (in milliseconds for email tokens)
export const TOKEN_EXPIRY = {
    ACCESS_TOKEN: "15m",
    REFRESH_TOKEN: "7d",
    EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
    RESEND_COOLDOWN: 2 * 60 * 1000, // 2 minutes
};

// Cookie Options
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
};

// File Upload Limits
export const UPLOAD_LIMITS = {
    VIDEO_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
    IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
};

// Rate Limiting
export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
};

// Regex Patterns
export const PATTERNS = {
    MONGO_ID: /^[0-9a-fA-F]{24}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
};

// Database Collections (for aggregation lookups)
export const COLLECTIONS = {
    USERS: "users",
    VIDEOS: "videos",
    PLAYLISTS: "playlists",
    COMMENTS: "comments",
    LIKES: "likes",
    SUBSCRIPTIONS: "subscriptions",
};

// Centralized Error Messages
export const ERROR_MESSAGES = {
    // Authentication
    UNAUTHORIZED: "Unauthorized request",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
    SESSION_EXPIRED: "Session expired. Please login again",
    
    // Validation
    VALIDATION_ERROR: "Validation error",
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_ID: (type) => `Invalid ${type} ID`,
    
    // Not Found
    USER_NOT_FOUND: "User not found",
    VIDEO_NOT_FOUND: "Video not found",
    RESOURCE_NOT_FOUND: (resource) => `${resource} not found`,
    
    // Conflict
    ALREADY_EXISTS: (field) => `${field} already exists`,
    DUPLICATE_ENTRY: "Duplicate entry detected",
    
    // Email
    EMAIL_SEND_FAILED: "Failed to send email. Please try again",
    INVALID_TOKEN: "Invalid or expired token",
    EMAIL_ALREADY_VERIFIED: "Email is already verified",
    
    // Generic
    INTERNAL_ERROR: "An internal error occurred",
    FORBIDDEN: "You don't have permission to perform this action",
};

