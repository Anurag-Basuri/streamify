/**
 * Services Index
 * Central export for all API services
 *
 * Usage:
 * import { api, signIn, getAllVideos } from '@/services';
 */

// ============================================================================
// API CLIENT
// ============================================================================

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
    updateUserDetails,
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

export { uploadFile } from "./upload";
