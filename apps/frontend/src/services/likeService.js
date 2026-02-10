/**
 * Like Service
 * Handles all like-related API calls using the centralized API client
 */
import { api, ApiError } from "./api";

// Like API endpoints
const LIKE_ENDPOINTS = {
    TOGGLE_VIDEO: (videoId) => `/api/v1/likes/toggle/video/${videoId}`,
    TOGGLE_COMMENT: (commentId) => `/api/v1/likes/toggle/comment/${commentId}`,
    TOGGLE_TWEET: (tweetId) => `/api/v1/likes/toggle/tweet/${tweetId}`,
    LIKED_VIDEOS: "/api/v1/likes/videos",
    FILTER: "/api/v1/likes/filter",
};

/**
 * Toggle like on a video
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} { likes: number, state: 0|1 }
 */
export const toggleVideoLike = async (videoId) => {
    try {
        const response = await api.post(LIKE_ENDPOINTS.TOGGLE_VIDEO(videoId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Toggle like on a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>} { likes: number, isLiked: boolean }
 */
export const toggleCommentLike = async (commentId) => {
    try {
        const response = await api.post(
            LIKE_ENDPOINTS.TOGGLE_COMMENT(commentId)
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Toggle like on a tweet
 * @param {string} tweetId - Tweet ID
 * @returns {Promise<Object>} { likes: number, state: 0|1 }
 */
export const toggleTweetLike = async (tweetId) => {
    try {
        const response = await api.post(LIKE_ENDPOINTS.TOGGLE_TWEET(tweetId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get user's liked videos with pagination
 * @param {Object} options - { page, limit }
 * @returns {Promise<Object>} Paginated liked videos
 */
export const getLikedVideos = async ({ page = 1, limit = 10 } = {}) => {
    try {
        const response = await api.get(LIKE_ENDPOINTS.LIKED_VIDEOS, {
            params: { page, limit },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get liked entities by type
 * @param {string} entityType - 'Video' | 'Comment' | 'Tweet'
 * @returns {Promise<Array>} List of liked entity IDs
 */
export const getLikedEntities = async (entityType) => {
    try {
        const response = await api.get(LIKE_ENDPOINTS.FILTER, {
            params: { entityType },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export default {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedEntities,
};
