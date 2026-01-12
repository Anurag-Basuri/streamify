/**
 * Application Configuration
 * Centralized app-wide settings and feature flags
 */

// ============================================================================
// APP INFO
// ============================================================================

export const APP_INFO = {
    name: "Streamify",
    version: "1.0.0",
    description: "Modern video streaming platform",
    author: "Streamify Team",
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
    // Authentication
    googleAuth: true,
    emailVerification: true,
    passwordReset: true,

    // Video features
    videoUpload: true,
    videoComments: true,
    videoLikes: true,

    // Social features
    playlists: true,
    watchLater: true,
    watchHistory: true,
    subscriptions: true,

    // UI features
    darkMode: true,
    animations: true,
    keyboardShortcuts: true,
};

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
    defaultPageSize: 12,
    pageSizeOptions: [12, 24, 48],
    maxPageSize: 100,
};

// ============================================================================
// MEDIA SETTINGS
// ============================================================================

export const MEDIA = {
    // Video settings
    video: {
        maxSize: 500 * 1024 * 1024, // 500MB
        allowedTypes: [
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
        ],
        allowedExtensions: [".mp4", ".webm", ".ogg", ".mov"],
    },

    // Image settings (thumbnails, avatars, covers)
    image: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],

        // Avatar dimensions
        avatar: {
            width: 200,
            height: 200,
        },

        // Cover image dimensions
        cover: {
            width: 1920,
            height: 400,
        },

        // Thumbnail dimensions
        thumbnail: {
            width: 1280,
            height: 720,
        },
    },
};

// ============================================================================
// VALIDATION
// ============================================================================

export const VALIDATION = {
    // User validation
    user: {
        usernameMinLength: 3,
        usernameMaxLength: 30,
        usernamePattern: /^[a-zA-Z0-9_]+$/,
        passwordMinLength: 6,
        passwordMaxLength: 128,
        fullNameMinLength: 2,
        fullNameMaxLength: 50,
    },

    // Video validation
    video: {
        titleMinLength: 3,
        titleMaxLength: 100,
        descriptionMaxLength: 5000,
        maxTags: 10,
        tagMaxLength: 30,
    },

    // Playlist validation
    playlist: {
        nameMinLength: 1,
        nameMaxLength: 100,
        descriptionMaxLength: 500,
    },

    // Comment validation
    comment: {
        minLength: 1,
        maxLength: 10000,
    },
};

// ============================================================================
// UI SETTINGS
// ============================================================================

export const UI = {
    // Animation durations (ms)
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
    },

    // Toast notification durations (ms)
    toast: {
        success: 3000,
        error: 5000,
        warning: 4000,
        info: 3000,
    },

    // Debounce delays (ms)
    debounce: {
        search: 300,
        input: 150,
        resize: 100,
    },

    // Skeleton loading count
    skeleton: {
        videoCards: 8,
        comments: 3,
        playlists: 6,
    },
};

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    backdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
};

// ============================================================================
// BREAKPOINTS (matches Tailwind)
// ============================================================================

export const BREAKPOINTS = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    APP_INFO,
    FEATURES,
    PAGINATION,
    MEDIA,
    VALIDATION,
    UI,
    Z_INDEX,
    BREAKPOINTS,
};
