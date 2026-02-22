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
    FOLLOWS: "/api/v1/follows",
    TWEETS: "/api/v1/tweets",
    DASHBOARD: "/api/v1/dashboard",
    NOTIFICATIONS: "/api/v1/notifications",
    HEALTHCHECK: "/health",
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
    CREATE: `${BASE.VIDEOS}/upload`,
    UPDATE: (id) => `${BASE.VIDEOS}/update/${id}`,
    DELETE: (id) => `${BASE.VIDEOS}/${id}`,

    // Video actions
    TOGGLE_PUBLISH: (id) => `${BASE.VIDEOS}/${id}/publish`,
    INCREMENT_VIEW: (id) => `${BASE.VIDEOS}/${id}/views`,

    // User's videos
    USER_VIDEOS: (userId) => `${BASE.VIDEOS}/user/${userId}`,
    RECOMMENDATIONS: (videoId) =>
        videoId
            ? `${BASE.VIDEOS}/recommendations/${videoId}`
            : `${BASE.VIDEOS}/recommendations`,
    DOWNLOAD: (id) => `${BASE.VIDEOS}/${id}/download`,
};

// ============================================================================
// PLAYLIST ENDPOINTS
// ============================================================================

export const PLAYLISTS = {
    LIST: BASE.PLAYLISTS,
    GET: (id) => `${BASE.PLAYLISTS}/${id}`,
    CREATE: `${BASE.PLAYLISTS}/create`,
    UPDATE: (id) => `${BASE.PLAYLISTS}/update/${id}`,
    DELETE: (id) => `${BASE.PLAYLISTS}/delete/${id}`,

    // Playlist videos
    ADD_VIDEO: (playlistId, videoId) =>
        `${BASE.PLAYLISTS}/${playlistId}/videos/${videoId}`,
    REMOVE_VIDEO: (playlistId, videoId) =>
        `${BASE.PLAYLISTS}/remove/${playlistId}/videos/${videoId}`,
    REORDER: (playlistId) => `${BASE.PLAYLISTS}/${playlistId}/reorder`,

    // User's playlists
    USER_PLAYLISTS: BASE.PLAYLISTS,
};

// ============================================================================
// WATCH LATER ENDPOINTS
// ============================================================================

export const WATCH_LATER = {
    LIST: "/api/v1/watchlater",
    ADD: (videoId) => `/api/v1/watchlater/${videoId}`,
    REMOVE: (videoId) => `/api/v1/watchlater/${videoId}`,
    CLEAR: "/api/v1/watchlater/clear",
    STATS: "/api/v1/watchlater/stats",
    UPDATE_REMINDER: (videoId) => `/api/v1/watchlater/${videoId}/reminder`,
};

// ============================================================================
// HISTORY ENDPOINTS
// ============================================================================

export const HISTORY = {
    LIST: "/api/v1/history",
    ADD: (videoId) => `/api/v1/history/add/${videoId}`,
    REMOVE: (videoId) => `/api/v1/history/${videoId}`,
    CLEAR: "/api/v1/history/clear",
    BATCH_REMOVE: "/api/v1/history/batch",
    STATS: "/api/v1/history/stats",
};

// ============================================================================
// COMMENT ENDPOINTS
// ============================================================================

export const COMMENTS = {
    LIST: (entityType, entityId) =>
        `${BASE.COMMENTS}/${entityType}/${entityId}`,
    CREATE: (entityType, entityId) =>
        `${BASE.COMMENTS}/${entityType}/${entityId}`,
    UPDATE: (commentId) => `${BASE.COMMENTS}/${commentId}`,
    DELETE: (commentId) => `${BASE.COMMENTS}/${commentId}`,
    COUNT: (entityType, entityId) =>
        `${BASE.COMMENTS}/count/${entityType}/${entityId}`,
    REPLIES: (commentId) => `${BASE.COMMENTS}/replies/${commentId}`,
    PIN: (commentId) => `${BASE.COMMENTS}/${commentId}/pin`,
    HEART: (commentId) => `${BASE.COMMENTS}/${commentId}/heart`,
};

// ============================================================================
// LIKE ENDPOINTS
// ============================================================================

export const LIKES = {
    TOGGLE_VIDEO: (videoId) => `${BASE.LIKES}/toggle/video/${videoId}`,
    TOGGLE_COMMENT: (commentId) => `${BASE.LIKES}/toggle/comment/${commentId}`,
    TOGGLE_TWEET: (tweetId) => `${BASE.LIKES}/toggle/tweet/${tweetId}`,
    LIKED_VIDEOS: `${BASE.LIKES}/videos`,
    FILTER: `${BASE.LIKES}/filter`,
};

// ============================================================================
// SUBSCRIPTION ENDPOINTS
// ============================================================================

export const SUBSCRIPTIONS = {
    // POST /:channelId/toggle - Toggle subscription
    TOGGLE: (channelId) => `${BASE.SUBSCRIPTIONS}/${channelId}/toggle`,
    // GET /subscribed-channels - Get user's subscribed channels
    USER_SUBSCRIPTIONS: `${BASE.SUBSCRIPTIONS}/subscribed-channels`,
    // GET /check/:channelId - Check subscription status
    CHECK: (channelId) => `${BASE.SUBSCRIPTIONS}/check/${channelId}`,
    // GET /:channelId/subscribers - Get channel's subscribers
    CHANNEL_SUBSCRIBERS: (channelId) =>
        `${BASE.SUBSCRIPTIONS}/${channelId}/subscribers`,
};

// ============================================================================
// FOLLOW ENDPOINTS (Social follows for tweets)
// ============================================================================

export const FOLLOWS = {
    // POST /:userId/toggle - Toggle follow
    TOGGLE: (userId) => `${BASE.FOLLOWS}/${userId}/toggle`,
    // GET /check/:userId - Check follow status
    CHECK: (userId) => `${BASE.FOLLOWS}/check/${userId}`,
    // GET /:userId/followers - Get user's followers
    FOLLOWERS: (userId) => `${BASE.FOLLOWS}/${userId}/followers`,
    // GET /:userId/following - Get user's following
    FOLLOWING: (userId) => `${BASE.FOLLOWS}/${userId}/following`,
    // GET /followers - Get current user's followers
    MY_FOLLOWERS: `${BASE.FOLLOWS}/followers`,
    // GET /following - Get current user's following
    MY_FOLLOWING: `${BASE.FOLLOWS}/following`,
};

// ============================================================================
// TWEET ENDPOINTS
// ============================================================================

export const TWEETS = {
    // GET / - Get latest tweets (public)
    LIST: BASE.TWEETS,
    // POST /create - Create new tweet
    CREATE: `${BASE.TWEETS}/create`,
    // GET /:userId - Get user's tweets
    USER_TWEETS: (userId) => `${BASE.TWEETS}/${userId}`,
    // GET /feed - Get following feed
    FEED: `${BASE.TWEETS}/feed`,
    // PUT /:tweetId - Update tweet
    UPDATE: (tweetId) => `${BASE.TWEETS}/${tweetId}`,
    // DELETE /:tweetId - Delete tweet
    DELETE: (tweetId) => `${BASE.TWEETS}/${tweetId}`,
};

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export const DASHBOARD = {
    STATS: `${BASE.DASHBOARD}`,
    ANALYTICS: `${BASE.DASHBOARD}/analytics`,
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
    WATCH_LATER,
    HISTORY,
    COMMENTS,
    LIKES,
    SUBSCRIPTIONS,
    FOLLOWS,
    TWEETS,
    DASHBOARD,
    NOTIFICATIONS,
    UTILITY,
};

export default ENDPOINTS;
