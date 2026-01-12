/**
 * History Service
 * Handles watch history API calls using the centralized API client
 */
import { api, ApiError } from "./api";

// History API endpoints
const HISTORY_ENDPOINTS = {
    GET_HISTORY: "/api/v1/history",
    ADD_TO_HISTORY: (videoId) => `/api/v1/history/add/${videoId}`,
    REMOVE_FROM_HISTORY: (videoId) => `/api/v1/history/${videoId}`,
    CLEAR_HISTORY: "/api/v1/history/clear",
};

/**
 * Get user's watch history
 * @param {Object} options - { page, limit }
 * @returns {Promise<Object>} Paginated history
 */
export const getHistory = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(HISTORY_ENDPOINTS.GET_HISTORY, {
            params: { page, limit },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Add video to watch history
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Result
 */
export const addToHistory = async (videoId) => {
    try {
        const response = await api.post(
            HISTORY_ENDPOINTS.ADD_TO_HISTORY(videoId)
        );
        return response.data.data;
    } catch (error) {
        // Don't throw for history failures - not critical
        console.error("Failed to add to history:", error);
        return null;
    }
};

/**
 * Remove video from history
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Result
 */
export const removeFromHistory = async (videoId) => {
    try {
        const response = await api.delete(
            HISTORY_ENDPOINTS.REMOVE_FROM_HISTORY(videoId)
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Clear all watch history
 * @returns {Promise<Object>} Result
 */
export const clearHistory = async () => {
    try {
        const response = await api.delete(HISTORY_ENDPOINTS.CLEAR_HISTORY);
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export default {
    getHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
};
