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
    VERIFY_EMAIL: (token) => `/api/v1/users/verify-email/${token}`,
    FORGOT_PASSWORD: "/api/v1/users/forgot-password",
    RESET_PASSWORD: (token) => `/api/v1/users/reset-password/${token}`,
    RESEND_VERIFICATION: "/api/v1/users/resend-verification",
    GOOGLE_AUTH: "/api/v1/users/auth/google",
    GOOGLE_CLIENT_ID: "/api/v1/users/auth/google/client-id",
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

// ==========================================
// Google OAuth
// ==========================================

// Cache for Google Client ID
let cachedGoogleClientId = null;

/**
 * Get Google Client ID from backend
 * @returns {Promise<string|null>} Google Client ID or null if not configured
 */
export const getGoogleClientId = async () => {
    if (cachedGoogleClientId !== null) {
        return cachedGoogleClientId;
    }

    try {
        const response = await api.get(AUTH_ENDPOINTS.GOOGLE_CLIENT_ID);
        const { clientId, enabled } = response.data.data;
        cachedGoogleClientId = enabled ? clientId : null;
        return cachedGoogleClientId;
    } catch (error) {
        console.error("Failed to get Google Client ID:", error);
        cachedGoogleClientId = null;
        return null;
    }
};

/**
 * Authenticate with Google credential
 * @param {string} credential - Google ID token from Google Sign-In
 * @returns {Promise<Object>} User data with tokens
 */
export const googleSignIn = async (credential) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.GOOGLE_AUTH, {
            credential,
        });
        const { accessToken, refreshToken, user } = response.data.data;

        TokenService.setTokens(accessToken, refreshToken);

        return { user, accessToken, refreshToken };
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Initialize Google Sign-In and handle the popup flow
 * @returns {Promise<Object>} User data with tokens
 */
export const handleGoogleAuth = async () => {
    const clientId = await getGoogleClientId();

    if (!clientId) {
        throw new ApiError(503, "Google Sign-In is not configured");
    }

    return new Promise((resolve, reject) => {
        // Load Google Identity Services script if not loaded
        if (!window.google?.accounts) {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => initGoogleAuth(clientId, resolve, reject);
            script.onerror = () =>
                reject(new ApiError(500, "Failed to load Google Sign-In"));
            document.head.appendChild(script);
        } else {
            initGoogleAuth(clientId, resolve, reject);
        }
    });
};

/**
 * Initialize Google Auth and show popup
 */
const initGoogleAuth = (clientId, resolve, reject) => {
    try {
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
                try {
                    const result = await googleSignIn(response.credential);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            },
        });

        // Trigger the One Tap prompt or popup
        window.google.accounts.id.prompt((notification) => {
            if (
                notification.isNotDisplayed() ||
                notification.isSkippedMoment()
            ) {
                // Fall back to button click if One Tap doesn't show
                const buttonDiv = document.createElement("div");
                buttonDiv.id = "google-signin-button";
                buttonDiv.style.cssText =
                    "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;";
                document.body.appendChild(buttonDiv);

                window.google.accounts.id.renderButton(buttonDiv, {
                    theme: "outline",
                    size: "large",
                    type: "standard",
                    text: "continue_with",
                });

                // Auto-click the button
                setTimeout(() => {
                    const btn = buttonDiv.querySelector('[role="button"]');
                    if (btn) btn.click();
                    // Clean up after a delay
                    setTimeout(() => buttonDiv.remove(), 100);
                }, 100);
            }
        });
    } catch (error) {
        reject(new ApiError(500, "Failed to initialize Google Sign-In"));
    }
};

// ==========================================
// Email Verification & Password Reset
// ==========================================

/**
 * Verify email with token
 * @param {string} token - Verification token from email
 * @returns {Promise<Object>}
 */
export const verifyEmail = async (token) => {
    try {
        const response = await api.get(AUTH_ENDPOINTS.VERIFY_EMAIL(token));
        return response.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Request password reset email
 * @param {string} email - User's email
 * @returns {Promise<Object>}
 */
export const forgotPassword = async (email) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
            email,
        });
        return response.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>}
 */
export const resetPassword = async (token, password, confirmPassword) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD(token), {
            password,
            confirmPassword,
        });
        return response.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Resend verification email (requires auth)
 * @returns {Promise<Object>}
 */
export const resendVerification = async () => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.RESEND_VERIFICATION);
        return response.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

// Re-export for backward compatibility
export { api as apiClient, TokenService };
