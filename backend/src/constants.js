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

// Token Expiry
export const TOKEN_EXPIRY = {
    ACCESS_TOKEN: "15m",
    REFRESH_TOKEN: "7d",
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
