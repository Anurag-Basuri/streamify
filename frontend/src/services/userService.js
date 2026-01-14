/**
 * User Service
 * Handles user profile operations
 */
import { api } from "./api";
import { USERS } from "../constants/api.constants";

/**
 * Get public user profile by username
 * @param {string} username - The username to fetch
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (username) => {
    try {
        const response = await api.get(USERS.PROFILE(username));
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const userService = {
    getUserProfile,
};

export default userService;
