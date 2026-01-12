/**
 * API Endpoints Constants
 * Centralized API endpoint definitions
 */

// ============================================================================
// BASE PATHS
// ============================================================================

const BASE = {
    USERS: "/api/v1/users",
    VIDEOS: "/api/v1/videos",
    PLAYLISTS: "/api/v1/playlists",
    COMMENTS: "/api/v1/comments",
    LIKES: "/api/v1/likes",
    SUBSCRIPTIONS: "/api/v1/subscriptions",
    TWEETS: "/api/v1/tweets",
    DASHBOARD: "/api/v1/dashboard",
    NOTIFICATIONS: "/api/v1/notifications",
    HEALTHCHECK: "/api/v1/healthcheck",
};

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const AUTH = {
    LOGIN: `${BASE.USERS}/login`,
    REGISTER: `${BASE.USERS}/register`,
    LOGOUT: `${BASE.USERS}/logout`,
    REFRESH_TOKEN: `${BASE.USERS}/refresh-token`,
    CURRENT_USER: `${BASE.USERS}/current-user`,

    // Google OAuth
    GOOGLE_AUTH: `${BASE.USERS}/auth/google`,
    GOOGLE_CLIENT_ID: `${BASE.USERS}/auth/google/client-id`,

    // Email verification
    VERIFY_EMAIL: (token) => `${BASE.USERS}/verify-email/${token}`,
    RESEND_VERIFICATION: `${BASE.USERS}/resend-verification`,

    // Password management
    FORGOT_PASSWORD: `${BASE.USERS}/forgot-password`,
    RESET_PASSWORD: (token) => `${BASE.USERS}/reset-password/${token}`,
    CHANGE_PASSWORD: `${BASE.USERS}/change-password`,
};

// ============================================================================
// USER ENDPOINTS
// ============================================================================

export const USERS = {
    PROFILE: (username) => `${BASE.USERS}/c/${username}`,
    UPDATE_DETAILS: `${BASE.USERS}/update-details`,
    CHANGE_AVATAR: `${BASE.USERS}/change-avatar`,
    CHANGE_COVER: `${BASE.USERS}/change-cover-image`,
};

// ============================================================================
// VIDEO ENDPOINTS
// ============================================================================

export const VIDEOS = {
    LIST: BASE.VIDEOS,
    GET: (id) => `${BASE.VIDEOS}/${id}`,
    CREATE: BASE.VIDEOS,
    UPDATE: (id) => `${BASE.VIDEOS}/${id}`,
    DELETE: (id) => `${BASE.VIDEOS}/${id}`,

    // Video actions
    TOGGLE_PUBLISH: (id) => `${BASE.VIDEOS}/toggle/publish/${id}`,
    INCREMENT_VIEW: (id) => `${BASE.VIDEOS}/view/${id}`,

    // User's videos
    USER_VIDEOS: (userId) => `${BASE.VIDEOS}/user/${userId}`,
};

// ============================================================================
// PLAYLIST ENDPOINTS
// ============================================================================

export const PLAYLISTS = {
    LIST: BASE.PLAYLISTS,
    GET: (id) => `${BASE.PLAYLISTS}/${id}`,
    CREATE: BASE.PLAYLISTS,
    UPDATE: (id) => `${BASE.PLAYLISTS}/${id}`,
    DELETE: (id) => `${BASE.PLAYLISTS}/${id}`,

    // Playlist videos
    ADD_VIDEO: (playlistId, videoId) =>
        `${BASE.PLAYLISTS}/add/${videoId}/${playlistId}`,
    REMOVE_VIDEO: (playlistId, videoId) =>
        `${BASE.PLAYLISTS}/remove/${videoId}/${playlistId}`,

    // User's playlists
    USER_PLAYLISTS: (userId) => `${BASE.PLAYLISTS}/user/${userId}`,

    // Watch later
    WATCH_LATER: `${BASE.PLAYLISTS}/watch-later`,
    WATCH_LATER_TOGGLE: (videoId) => `${BASE.PLAYLISTS}/watch-later/${videoId}`,
    WATCH_LATER_STATUS: (videoId) =>
        `${BASE.PLAYLISTS}/watch-later/status/${videoId}`,

    // Watch history
    HISTORY: `${BASE.PLAYLISTS}/history`,
    HISTORY_ADD: (videoId) => `${BASE.PLAYLISTS}/history/${videoId}`,
    HISTORY_CLEAR: `${BASE.PLAYLISTS}/history/clear`,
};

// ============================================================================
// COMMENT ENDPOINTS
// ============================================================================

export const COMMENTS = {
    VIDEO_COMMENTS: (videoId) => `${BASE.COMMENTS}/${videoId}`,
    CREATE: (videoId) => `${BASE.COMMENTS}/${videoId}`,
    UPDATE: (commentId) => `${BASE.COMMENTS}/c/${commentId}`,
    DELETE: (commentId) => `${BASE.COMMENTS}/c/${commentId}`,
};

// ============================================================================
// LIKE ENDPOINTS
// ============================================================================

export const LIKES = {
    TOGGLE_VIDEO: (videoId) => `${BASE.LIKES}/toggle/v/${videoId}`,
    TOGGLE_COMMENT: (commentId) => `${BASE.LIKES}/toggle/c/${commentId}`,
    TOGGLE_TWEET: (tweetId) => `${BASE.LIKES}/toggle/t/${tweetId}`,
    LIKED_VIDEOS: `${BASE.LIKES}/videos`,
};

// ============================================================================
// SUBSCRIPTION ENDPOINTS
// ============================================================================

export const SUBSCRIPTIONS = {
    TOGGLE: (channelId) => `${BASE.SUBSCRIPTIONS}/c/${channelId}`,
    CHANNEL_SUBSCRIBERS: (channelId) => `${BASE.SUBSCRIPTIONS}/c/${channelId}`,
    USER_SUBSCRIPTIONS: `${BASE.SUBSCRIPTIONS}/u`,
};

// ============================================================================
// TWEET ENDPOINTS
// ============================================================================

export const TWEETS = {
    LIST: BASE.TWEETS,
    CREATE: BASE.TWEETS,
    GET: (id) => `${BASE.TWEETS}/${id}`,
    UPDATE: (id) => `${BASE.TWEETS}/${id}`,
    DELETE: (id) => `${BASE.TWEETS}/${id}`,
    USER_TWEETS: (userId) => `${BASE.TWEETS}/user/${userId}`,
};

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export const DASHBOARD = {
    STATS: `${BASE.DASHBOARD}/stats`,
    VIDEOS: `${BASE.DASHBOARD}/videos`,
};

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

export const NOTIFICATIONS = {
    LIST: BASE.NOTIFICATIONS,
    MARK_READ: (id) => `${BASE.NOTIFICATIONS}/${id}/read`,
    MARK_ALL_READ: `${BASE.NOTIFICATIONS}/read-all`,
    DELETE: (id) => `${BASE.NOTIFICATIONS}/${id}`,
    CLEAR_ALL: `${BASE.NOTIFICATIONS}/all`,
};

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

export const UTILITY = {
    HEALTHCHECK: BASE.HEALTHCHECK,
};

// ============================================================================
// ALL ENDPOINTS OBJECT
// ============================================================================

export const ENDPOINTS = {
    AUTH,
    USERS,
    VIDEOS,
    PLAYLISTS,
    COMMENTS,
    LIKES,
    SUBSCRIPTIONS,
    TWEETS,
    DASHBOARD,
    NOTIFICATIONS,
    UTILITY,
};

export default ENDPOINTS;
