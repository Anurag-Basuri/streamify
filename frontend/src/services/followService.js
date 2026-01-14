/**
 * Follow Service
 * Handles social follow relationships (for tweets/social feed)
 * Separate from subscription service which handles video channel subscriptions
 */
import { api } from "./api";
import { FOLLOWS } from "../constants/api.constants";

/**
 * Toggle follow status for a user
 * @param {string} userId - The user ID to follow/unfollow
 * @returns {Promise<{isFollowing: boolean, followersCount: number}>}
 */
export const toggleFollow = async (userId) => {
    try {
        const response = await api.post(FOLLOWS.TOGGLE(userId));
        return response.data;
    } catch (error) {
        console.error("Error toggling follow:", error);
        throw error;
    }
};

/**
 * Check if current user follows a specific user
 * @param {string} userId - The user ID to check
 * @returns {Promise<{isFollowing: boolean}>}
 */
export const checkFollow = async (userId) => {
    try {
        const response = await api.get(FOLLOWS.CHECK(userId));
        return response.data;
    } catch (error) {
        console.error("Error checking follow status:", error);
        throw error;
    }
};

/**
 * Get followers of a user
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @returns {Promise<{docs: Array, totalDocs: number, page: number, totalPages: number}>}
 */
export const getFollowers = async (userId, { page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(FOLLOWS.FOLLOWERS(userId), {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching followers:", error);
        throw error;
    }
};

/**
 * Get users that a user is following
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @returns {Promise<{docs: Array, totalDocs: number, page: number, totalPages: number}>}
 */
export const getFollowing = async (userId, { page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(FOLLOWS.FOLLOWING(userId), {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching following:", error);
        throw error;
    }
};

/**
 * Get current user's followers
 * @param {Object} options - Pagination options
 * @returns {Promise<{docs: Array, totalDocs: number, page: number, totalPages: number}>}
 */
export const getMyFollowers = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(FOLLOWS.MY_FOLLOWERS, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching my followers:", error);
        throw error;
    }
};

/**
 * Get users the current user is following
 * @param {Object} options - Pagination options
 * @returns {Promise<{docs: Array, totalDocs: number, page: number, totalPages: number}>}
 */
export const getMyFollowing = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(FOLLOWS.MY_FOLLOWING, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching my following:", error);
        throw error;
    }
};

export const followService = {
    toggleFollow,
    checkFollow,
    getFollowers,
    getFollowing,
    getMyFollowers,
    getMyFollowing,
};

export default followService;
