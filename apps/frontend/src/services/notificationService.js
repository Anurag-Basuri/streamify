/**
 * Notification Service
 * Handles data fetching and updates for user notifications
 */
import { api, ApiError } from "./api";
import { NOTIFICATIONS } from "../constants/api.constants";

/**
 * Get all notifications for the current user
 * @param {Object} params - Query parameters (page, limit, filter)
 * @returns {Promise<Object>} List of notifications and pagination logic
 */
export const getNotifications = async (params = {}) => {
    try {
        const response = await api.get(NOTIFICATIONS.LIST, { params });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Mark a single notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (id) => {
    try {
        const response = await api.patch(NOTIFICATIONS.MARK_READ(id));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Success message and count
 */
export const markAllAsRead = async () => {
    try {
        const response = await api.patch(NOTIFICATIONS.MARK_ALL_READ);
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Delete a notification
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Success message
 */
export const deleteNotification = async (id) => {
    try {
        await api.delete(NOTIFICATIONS.DELETE(id));
        return { success: true, id };
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Clear all notifications
 * @returns {Promise<Object>} Success message
 */
export const clearAllNotifications = async () => {
    try {
        await api.delete(NOTIFICATIONS.CLEAR_ALL);
        return { success: true };
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export const notificationService = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
};

export default notificationService;
