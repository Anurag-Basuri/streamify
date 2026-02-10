// Centralized API client with industry-standard error handling
import axios from "axios";

// API Configuration
const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    timeout: 30000, // 30 seconds
    withCredentials: true,
};

// Create axios instance
const apiClient = axios.create({
    ...API_CONFIG,
    headers: {
        "Content-Type": "application/json",
    },
});

// Token management
const TokenService = {
    getAccessToken: () => localStorage.getItem("accessToken"),
    getRefreshToken: () => localStorage.getItem("refreshToken"),
    setTokens: (accessToken, refreshToken) => {
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    },
    clearTokens: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },
    isTokenExpired: (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    },
};

// Custom API Error class
class ApiError extends Error {
    constructor(message, statusCode, errors = [], originalError = null) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.errors = errors;
        this.originalError = originalError;
        this.isApiError = true;
    }

    static fromAxiosError(error) {
        if (error.response) {
            // Server responded with error status
            const { data, status } = error.response;
            return new ApiError(
                data?.message || "An error occurred",
                status,
                data?.errors || [],
                error
            );
        } else if (error.request) {
            // Request made but no response
            return new ApiError(
                "Unable to connect to server. Please check your connection.",
                0,
                [],
                error
            );
        } else {
            // Error setting up request
            return new ApiError(
                error.message || "An unexpected error occurred",
                -1,
                [],
                error
            );
        }
    }
}

// Request queue for handling concurrent token refreshes
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeToTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

const onTokenRefreshFailed = (error) => {
    refreshSubscribers.forEach((callback) => callback(null, error));
    refreshSubscribers = [];
};

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = TokenService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(ApiError.fromAxiosError(error))
);

// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry if it's a refresh token request or already retried
        if (
            originalRequest?.url?.includes("/refresh-token") ||
            originalRequest?.url?.includes("/login") ||
            originalRequest?.url?.includes("/register") ||
            originalRequest?._retry
        ) {
            return Promise.reject(ApiError.fromAxiosError(error));
        }

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401) {
            if (isRefreshing) {
                // Wait for the ongoing refresh to complete
                return new Promise((resolve, reject) => {
                    subscribeToTokenRefresh((token, refreshError) => {
                        if (refreshError) {
                            reject(refreshError);
                        } else if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        } else {
                            reject(ApiError.fromAxiosError(error));
                        }
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = TokenService.getRefreshToken();
                if (!refreshToken) {
                    throw new ApiError("No refresh token available", 401);
                }

                const response = await axios.post(
                    `${API_CONFIG.baseURL}/api/v1/users/refresh-token`,
                    { refreshToken },
                    { withCredentials: true }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                TokenService.setTokens(accessToken, newRefreshToken);
                
                onTokenRefreshed(accessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                TokenService.clearTokens();
                onTokenRefreshFailed(refreshError);
                
                // Dispatch custom event for auth context to handle
                window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
                
                return Promise.reject(
                    refreshError instanceof ApiError
                        ? refreshError
                        : ApiError.fromAxiosError(refreshError)
                );
            }
        }

        return Promise.reject(ApiError.fromAxiosError(error));
    }
);

// API helper functions
const api = {
    get: (url, config = {}) => apiClient.get(url, config),
    post: (url, data, config = {}) => apiClient.post(url, data, config),
    put: (url, data, config = {}) => apiClient.put(url, data, config),
    patch: (url, data, config = {}) => apiClient.patch(url, data, config),
    delete: (url, config = {}) => apiClient.delete(url, config),
    
    // Upload with progress
    upload: (url, formData, onProgress) => {
        return apiClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percent);
                }
            },
        });
    },
};

export { api, apiClient, ApiError, TokenService, API_CONFIG };
