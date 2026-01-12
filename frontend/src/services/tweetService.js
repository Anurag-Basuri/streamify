/**
 * Tweet Service
 * Handles all tweet-related API calls
 */
import { api, ApiError } from "./api";
import { TWEETS } from "../constants/api.constants";

/**
 * Get latest tweets (public feed)
 * @param {Object} options - { page, limit }
 * @returns {Promise<Array>} List of tweets
 */
export const getTweets = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(TWEETS.LIST, {
            params: { page, limit },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Create a new tweet
 * @param {Object} data - { content }
 * @returns {Promise<Object>} Created tweet
 */
export const createTweet = async (content) => {
    try {
        const response = await api.post(TWEETS.CREATE, { content });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get tweets by a specific user
 * @param {string} userId - User ID
 * @param {Object} options - { page, limit }
 * @returns {Promise<Array>} User's tweets
 */
export const getUserTweets = async (userId, { page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(TWEETS.USER_TWEETS(userId), {
            params: { page, limit },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Update an existing tweet
 * @param {string} tweetId - Tweet ID
 * @param {string} content - New content
 * @returns {Promise<Object>} Updated tweet
 */
export const updateTweet = async (tweetId, content) => {
    try {
        const response = await api.put(TWEETS.UPDATE(tweetId), { content });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Delete a tweet
 * @param {string} tweetId - Tweet ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTweet = async (tweetId) => {
    try {
        const response = await api.delete(TWEETS.DELETE(tweetId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export const tweetService = {
    getTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};

export default tweetService;
