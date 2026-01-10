/**
 * Frontend Constants
 * Centralized configuration values for consistency
 */

// API Configuration
export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    timeout: 30000,
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50,
};

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    THEME: "theme",
    SIDEBAR_STATE: "sidebarState",
    RECENT_SEARCHES: "recentSearches",
};

// Validation Rules
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    TITLE_MIN_LENGTH: 5,
    TITLE_MAX_LENGTH: 100,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME_PATTERN: /^[a-zA-Z0-9_]*$/,
};

// File Upload
export const UPLOAD = {
    MAX_VIDEO_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
};

// Toast Configuration
export const TOAST_CONFIG = {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
    POSITION: "top-right",
};

// Animation Durations (ms)
export const ANIMATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
};

// Debounce/Throttle Delays (ms)
export const DELAYS = {
    SEARCH_DEBOUNCE: 300,
    RESIZE_DEBOUNCE: 150,
    SCROLL_THROTTLE: 100,
    API_RETRY: 1000,
};

// Routes
export const ROUTES = {
    HOME: "/",
    AUTH: "/auth",
    PROFILE: "/profile",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_EMAIL: "/verify-email",
    VIDEO: "/video",
    CREATE: "/create",
    HISTORY: "/history",
    PLAYLIST: "/playlist",
    SUBSCRIPTION: "/subscription",
    WATCHLATER: "/watchlater",
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: "Unable to connect. Please check your connection.",
    SESSION_EXPIRED: "Your session has expired. Please login again.",
    UNAUTHORIZED: "You need to be logged in to access this resource.",
    NOT_FOUND: "The requested resource was not found.",
    SERVER_ERROR: "Something went wrong. Please try again later.",
    VALIDATION_ERROR: "Please check your input and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: "Welcome back!",
    REGISTER: "Account created successfully!",
    LOGOUT: "Logged out successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    VIDEO_UPLOADED: "Video uploaded successfully",
    VIDEO_DELETED: "Video deleted successfully",
};
