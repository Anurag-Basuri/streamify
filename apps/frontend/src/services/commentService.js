/**
 * Comment Service
 * Handles all comment-related API calls using the centralized API client
 */
import { api, ApiError } from "./api";

// Comment API endpoints
const COMMENT_ENDPOINTS = {
    GET_COMMENTS: (entityType, entityId) =>
        `/api/v1/comments/${entityType}/${entityId}`,
    ADD_COMMENT: (entityType, entityId) =>
        `/api/v1/comments/${entityType}/${entityId}`,
    UPDATE_COMMENT: (commentId) => `/api/v1/comments/${commentId}`,
    DELETE_COMMENT: (commentId) => `/api/v1/comments/${commentId}`,
    COUNT_COMMENTS: (entityType, entityId) =>
        `/api/v1/comments/count/${entityType}/${entityId}`,
};

/**
 * Get comments for an entity (Video or Tweet)
 * @param {string} entityType - 'Video' | 'Tweet'
 * @param {string} entityId - Entity ID
 * @param {Object} options - { page, limit }
 * @returns {Promise<Object>} { comments, pagination }
 */
export const getComments = async (
    entityType,
    entityId,
    { page = 1, limit = 10 } = {}
) => {
    try {
        const response = await api.get(
            COMMENT_ENDPOINTS.GET_COMMENTS(entityType, entityId),
            { params: { page, limit } }
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Add a comment to an entity
 * @param {string} entityType - 'Video' | 'Tweet'
 * @param {string} entityId - Entity ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} Created comment
 */
export const addComment = async (entityType, entityId, content) => {
    try {
        const response = await api.post(
            COMMENT_ENDPOINTS.ADD_COMMENT(entityType, entityId),
            { content }
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {string} content - Updated content
 * @returns {Promise<Object>} Updated comment
 */
export const updateComment = async (commentId, content) => {
    try {
        const response = await api.put(
            COMMENT_ENDPOINTS.UPDATE_COMMENT(commentId),
            { content }
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteComment = async (commentId) => {
    try {
        const response = await api.delete(
            COMMENT_ENDPOINTS.DELETE_COMMENT(commentId)
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get comment count for an entity
 * @param {string} entityType - 'Video' | 'Tweet'
 * @param {string} entityId - Entity ID
 * @returns {Promise<number>} Comment count
 */
export const getCommentCount = async (entityType, entityId) => {
    try {
        const response = await api.get(
            COMMENT_ENDPOINTS.COUNT_COMMENTS(entityType, entityId)
        );
        return response.data.data.count;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export default {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentCount,
};
