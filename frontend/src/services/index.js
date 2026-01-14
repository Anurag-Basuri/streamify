// ============================================================================
// API CLIENT
// ===========================================================================

export { api, apiClient, ApiError, TokenService, API_CONFIG } from "./api";

// ============================================================================
// AUTH SERVICES
// ============================================================================

export {
    signIn,
    signUp,
    logout,
    refreshToken,
    getCurrentUser,
    updateAvatar,
    updateCoverImage,
    changePassword,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    // Google OAuth
    handleGoogleAuth,
    googleSignIn,
    getGoogleClientId,
} from "./authService";

// ============================================================================
// VIDEO SERVICES
// ============================================================================

export {
    getAllVideos,
    getVideoById,
    uploadVideo,
    updateVideo,
    deleteVideo,
    incrementViews,
    togglePublishStatus,
    getUserVideos,
    getDownloadUrl,
} from "./videoService";

// ============================================================================
// UPLOAD SERVICE
// ============================================================================

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from "./notificationService";

// ============================================================================
// UPLOAD SERVICE
// ============================================================================

export { uploadFile } from "./upload";

// ============================================================================
// LIKE SERVICE
// ============================================================================

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedEntities,
} from "./likeService";

// ============================================================================
// COMMENT SERVICE
// ============================================================================

export {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentCount,
} from "./commentService";

// ============================================================================
// HISTORY SERVICE
// ============================================================================

export {
    getHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
} from "./historyService";

// ============================================================================
// SUBSCRIPTION SERVICE (Video channel subscriptions)
// ============================================================================

export {
    toggleSubscription,
    checkSubscription,
    getChannelSubscribers,
    getUserSubscriptions,
} from "./subscriptionService";

// ============================================================================
// FOLLOW SERVICE (Social follows for tweets)
// ============================================================================

export {
    toggleFollow,
    checkFollow,
    getFollowers,
    getFollowing,
    getMyFollowers,
    getMyFollowing,
} from "./followService";

// ============================================================================
// USER SERVICE
// ============================================================================

export { getUserProfile } from "./userService";

// ============================================================================
// TWEET SERVICE
// ============================================================================

export {
    getTweets,
    getFollowingTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
} from "./tweetService";
