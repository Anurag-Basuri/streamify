/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
import { api, ApiError } from "./api";
import { SUBSCRIPTIONS } from "../constants/api.constants";

/**
 * Toggle subscription to a channel
 * @param {string} channelId - Channel/User ID to subscribe/unsubscribe
 * @returns {Promise<Object>} { subscribed: boolean, subscribersCount: number }
 */
export const toggleSubscription = async (channelId) => {
    try {
        const response = await api.post(SUBSCRIPTIONS.TOGGLE(channelId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Check if current user is subscribed to a channel
 * @param {string} channelId - Channel/User ID to check
 * @returns {Promise<Object>} { isSubscribed: boolean }
 */
export const checkSubscription = async (channelId) => {
    try {
        const response = await api.get(SUBSCRIPTIONS.CHECK(channelId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get subscribers of a channel
 * @param {string} channelId - Channel/User ID
 * @param {Object} options - { page, limit }
 * @returns {Promise<Object>} Paginated list of subscribers
 */
export const getChannelSubscribers = async (
    channelId,
    { page = 1, limit = 20 } = {}
) => {
    try {
        const response = await api.get(
            SUBSCRIPTIONS.CHANNEL_SUBSCRIBERS(channelId),
            {
                params: { page, limit },
            }
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get channels the current user is subscribed to
 * @param {Object} options - { page, limit }
 * @returns {Promise<Object>} Paginated list of subscribed channels
 */
export const getUserSubscriptions = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const response = await api.get(SUBSCRIPTIONS.USER_SUBSCRIPTIONS, {
            params: { page, limit },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export const subscriptionService = {
    toggleSubscription,
    checkSubscription,
    getChannelSubscribers,
    getUserSubscriptions,
};

export default subscriptionService;
