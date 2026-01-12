/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
import { api, ApiError } from "./api";
import { SUBSCRIPTIONS } from "../constants/api.constants";

/**
 * Toggle subscription to a channel (subscribe if not subscribed, unsubscribe if subscribed)
 * @param {string} channelId - Channel/User ID to subscribe/unsubscribe
 * @returns {Promise<Object>} { subscribed: boolean, subscribersCount: number, message: string }
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

/**
 * Check if current user is subscribed to a channel
 * Note: This calls the toggle endpoint with GET-like behavior to check status
 * Based on backend returning subscription status in toggle response
 * For now, we'll check by fetching subscribed channels and checking if channelId is in the list
 * @param {string} channelId - Channel/User ID to check
 * @returns {Promise<Object>} { isSubscribed: boolean }
 */
export const checkSubscription = async (channelId) => {
    try {
        // Fetch user's subscriptions and check if channelId exists
        const response = await api.get(SUBSCRIPTIONS.USER_SUBSCRIPTIONS);
        const subscriptions = response.data.data;
        const channelList = Array.isArray(subscriptions)
            ? subscriptions
            : subscriptions.docs || subscriptions.channels || [];

        const isSubscribed = channelList.some(
            (sub) => sub._id === channelId || sub.channel?._id === channelId
        );
        return { isSubscribed };
    } catch (error) {
        // If error fetching subscriptions, assume not subscribed
        console.error("Failed to check subscription:", error);
        return { isSubscribed: false };
    }
};

export const subscriptionService = {
    toggleSubscription,
    getChannelSubscribers,
    getUserSubscriptions,
    checkSubscription,
};

export default subscriptionService;
