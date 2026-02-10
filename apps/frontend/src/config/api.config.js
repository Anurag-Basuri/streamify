/**
 * API Configuration
 * Centralized API settings and environment-based configuration
 */

// ============================================================================
// ENVIRONMENT
// ============================================================================

const ENV = {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
};

// ============================================================================
// API SETTINGS
// ============================================================================

export const API_CONFIG = {
    // Base URL - uses environment variable or defaults to localhost
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",

    // API version prefix
    apiPrefix: "/api/v1",

    // Request timeout in milliseconds
    timeout: 30000, // 30 seconds

    // Upload timeout (longer for file uploads)
    uploadTimeout: 120000, // 2 minutes

    // Include credentials (cookies) in requests
    withCredentials: true,

    // Default headers
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },

    // Retry configuration
    retry: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        retryCondition: (error) => {
            // Retry on network errors or 5xx server errors
            return (
                !error.response ||
                (error.response.status >= 500 && error.response.status < 600)
            );
        },
    },
};

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};

// ============================================================================
// TOKEN CONFIGURATION
// ============================================================================

export const TOKEN_CONFIG = {
    accessTokenKey: "accessToken",
    refreshTokenKey: "refreshToken",
    tokenType: "Bearer",

    // Token expiry buffer (refresh token 1 minute before expiry)
    expiryBuffer: 60 * 1000, // 1 minute in ms
};

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
    // Default cache duration in milliseconds
    defaultTTL: 5 * 60 * 1000, // 5 minutes

    // Cache keys prefix
    prefix: "streamify_cache_",

    // Stale-while-revalidate duration
    staleTime: 30 * 1000, // 30 seconds
};

// ============================================================================
// FULL API URL HELPER
// ============================================================================

export const getApiUrl = (endpoint = "") => {
    const base = API_CONFIG.baseURL.replace(/\/$/, "");
    const prefix = API_CONFIG.apiPrefix;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${prefix}${path}`;
};

// ============================================================================
// EXPORTS
// ============================================================================

export { ENV };

export default {
    API_CONFIG,
    HTTP_STATUS,
    TOKEN_CONFIG,
    CACHE_CONFIG,
    ENV,
    getApiUrl,
};
