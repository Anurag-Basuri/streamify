/**
 * Constants Index
 * Central export for all constant modules
 *
 * Usage:
 * import { AUTH, VIDEOS, ROUTES, STORAGE_KEYS } from '@/constants';
 * // or
 * import ENDPOINTS from '@/constants/api.constants';
 */

// ============================================================================
// API ENDPOINTS
// ============================================================================

export {
    ENDPOINTS,
    AUTH,
    USERS,
    VIDEOS,
    PLAYLISTS,
    COMMENTS,
    LIKES,
    SUBSCRIPTIONS,
    TWEETS,
    DASHBOARD,
    UTILITY,
} from "./api.constants";

// ============================================================================
// ROUTES
// ============================================================================

export {
    ROUTES,
    PUBLIC_ROUTES,
    PROTECTED_ROUTES,
    ROUTE_META,
    NAV_ITEMS,
} from "./routes.constants";

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    THEME: "streamify_theme",
    SIDEBAR_STATE: "streamify_sidebar",
    RECENT_SEARCHES: "streamify_recent_searches",
    USER_PREFERENCES: "streamify_preferences",
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
    // Network errors
    NETWORK_ERROR: "Unable to connect. Please check your connection.",
    TIMEOUT: "Request timed out. Please try again.",

    // Auth errors
    SESSION_EXPIRED: "Your session has expired. Please login again.",
    UNAUTHORIZED: "You need to be logged in to access this.",
    FORBIDDEN: "You don't have permission to access this.",

    // Resource errors
    NOT_FOUND: "The requested resource was not found.",
    CONFLICT: "This resource already exists.",

    // Server errors
    SERVER_ERROR: "Something went wrong. Please try again later.",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable.",

    // Validation errors
    VALIDATION_ERROR: "Please check your input and try again.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    EMAIL_EXISTS: "An account with this email already exists.",
    USERNAME_EXISTS: "This username is already taken.",
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
    // Auth
    LOGIN: "Welcome back!",
    REGISTER: "Account created successfully! Please verify your email.",
    LOGOUT: "Logged out successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    PASSWORD_RESET: "Password reset successfully. You can now login.",
    EMAIL_VERIFIED: "Email verified successfully!",
    VERIFICATION_SENT: "Verification email sent!",

    // Profile
    PROFILE_UPDATED: "Profile updated successfully",
    AVATAR_UPDATED: "Avatar updated successfully",
    COVER_UPDATED: "Cover image updated successfully",

    // Video
    VIDEO_UPLOADED: "Video uploaded successfully",
    VIDEO_UPDATED: "Video updated successfully",
    VIDEO_DELETED: "Video deleted successfully",
    VIDEO_PUBLISHED: "Video published successfully",
    VIDEO_UNPUBLISHED: "Video unpublished",

    // Playlist
    PLAYLIST_CREATED: "Playlist created successfully",
    PLAYLIST_UPDATED: "Playlist updated successfully",
    PLAYLIST_DELETED: "Playlist deleted successfully",
    VIDEO_ADDED_TO_PLAYLIST: "Video added to playlist",
    VIDEO_REMOVED_FROM_PLAYLIST: "Video removed from playlist",

    // Watch Later
    ADDED_TO_WATCH_LATER: "Added to Watch Later",
    REMOVED_FROM_WATCH_LATER: "Removed from Watch Later",

    // Social
    SUBSCRIBED: "Subscribed successfully",
    UNSUBSCRIBED: "Unsubscribed",
    COMMENT_ADDED: "Comment added",
    COMMENT_DELETED: "Comment deleted",
};

// ============================================================================
// QUERY KEYS (for data fetching/caching)
// ============================================================================

export const QUERY_KEYS = {
    // User
    CURRENT_USER: "currentUser",
    USER_PROFILE: "userProfile",

    // Videos
    VIDEOS: "videos",
    VIDEO: "video",
    USER_VIDEOS: "userVideos",
    LIKED_VIDEOS: "likedVideos",

    // Playlists
    PLAYLISTS: "playlists",
    PLAYLIST: "playlist",
    WATCH_LATER: "watchLater",
    HISTORY: "history",

    // Social
    SUBSCRIPTIONS: "subscriptions",
    SUBSCRIBERS: "subscribers",
    COMMENTS: "comments",

    // Dashboard
    DASHBOARD_STATS: "dashboardStats",
};

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
    SEARCH: "/",
    SEARCH_ALT: "ctrl+k",
    ESCAPE: "Escape",
    HOME: "h",
    BACK: "Backspace",
    PLAY_PAUSE: "Space",
    FULLSCREEN: "f",
    MUTE: "m",
    SEEK_FORWARD: "ArrowRight",
    SEEK_BACKWARD: "ArrowLeft",
    VOLUME_UP: "ArrowUp",
    VOLUME_DOWN: "ArrowDown",
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
    STORAGE_KEYS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    QUERY_KEYS,
    KEYBOARD_SHORTCUTS,
};
