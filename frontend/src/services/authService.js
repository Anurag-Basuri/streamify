// Authentication service - handles all auth-related API calls
import { api, ApiError, TokenService } from "./api";

// Auth API endpoints
const AUTH_ENDPOINTS = {
    LOGIN: "/api/v1/users/login",
    REGISTER: "/api/v1/users/register",
    LOGOUT: "/api/v1/users/logout",
    REFRESH_TOKEN: "/api/v1/users/refresh-token",
    CURRENT_USER: "/api/v1/users/current-user",
    CHANGE_PASSWORD: "/api/v1/users/change-password",
    CHANGE_AVATAR: "/api/v1/users/change-avatar",
    CHANGE_COVER: "/api/v1/users/change-cover-image",
};

/**
 * Sign in user with email and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User data with tokens
 */
export const signIn = async (credentials) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
        const { accessToken, refreshToken, user } = response.data.data;

        TokenService.setTokens(accessToken, refreshToken);

        return { user, accessToken, refreshToken };
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Register new user
 * @param {Object} userData - { userName, fullName, email, password }
 * @returns {Promise<Object>} Created user data (no tokens - user must login)
 */
export const signUp = async (userData) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
        return {
            success: true,
            user: response.data.data,
            message: "Registration successful! Please login.",
        };
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Logout current user
 */
export const logout = async () => {
    try {
        await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
        // Log error but don't throw - always clear local state
        console.error("Logout API error:", error);
    } finally {
        TokenService.clearTokens();
        // Clear any session cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
    }
};

/**
 * Refresh access token
 * @returns {Promise<string>} New access token
 */
export const refreshToken = async () => {
    const storedRefreshToken = TokenService.getRefreshToken();

    if (!storedRefreshToken) {
        throw new ApiError("No refresh token available", 401);
    }

    try {
        const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
        TokenService.setTokens(accessToken, newRefreshToken);

        return accessToken;
    } catch (error) {
        TokenService.clearTokens();
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get(AUTH_ENDPOINTS.CURRENT_USER);
        return response.data.data;
    } catch (error) {
        if (error.statusCode === 401) {
            TokenService.clearTokens();
        }
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Update user avatar
 * @param {File} file - Avatar image file
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Updated user data
 */
export const updateAvatar = async (file, onProgress) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await api.upload(
            AUTH_ENDPOINTS.CHANGE_AVATAR,
            formData,
            onProgress
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Update cover image
 * @param {File} file - Cover image file
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Updated user data
 */
export const updateCoverImage = async (file, onProgress) => {
    const formData = new FormData();
    formData.append("coverImage", file);

    try {
        const response = await api.upload(
            AUTH_ENDPOINTS.CHANGE_COVER,
            formData,
            onProgress
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Change user password
 * @param {Object} passwords - { oldPassword, newPassword1, newPassword2 }
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (passwords) => {
    try {
        const response = await api.patch(
            AUTH_ENDPOINTS.CHANGE_PASSWORD,
            passwords
        );
        return response.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Initiate Google OAuth login (disabled until backend enables it)
 */
export const handleGoogleAuth = () => {
    console.warn("Google OAuth is currently disabled");
    // window.location.href = `${API_CONFIG.baseURL}/api/v1/users/auth/google`;
};

// Re-export for backward compatibility
export { api as apiClient, TokenService };
