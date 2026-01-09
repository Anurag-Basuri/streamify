import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1/users`
    : "http://localhost:8000/api/v1/users";

// Create Axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Create public Axios instance for unauthenticated requests
const publicClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only try to refresh if we get 401 and haven't already retried
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/refresh-token") &&
            !originalRequest.url.includes("/login")
        ) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Token refresh failed, clear storage and redirect
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/auth";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Get current user profile
export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get("/current-user");
        return response.data.data;
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
        throw new Error(
            error.response?.data?.message || "Failed to fetch user"
        );
    }
};

// Refresh access token
export const refreshToken = async () => {
    try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) {
            throw new Error("No refresh token available");
        }

        const response = await publicClient.post("/refresh-token", {
            refreshToken: storedRefreshToken,
        });

        // Backend returns { accessToken, refreshToken } in data.data
        const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

        if (!accessToken) {
            throw new Error("No access token received");
        }

        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
        }

        return accessToken;
    } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw error;
    }
};

// Sign in user
export const signIn = async (credentials) => {
    try {
        const response = await publicClient.post("/login", credentials);
        const { accessToken, refreshToken, user } = response.data.data;

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        return { accessToken, refreshToken, user };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Login failed");
    }
};

// Sign up new user (Note: Backend doesn't return tokens on registration)
export const signUp = async (userData) => {
    try {
        const response = await publicClient.post("/register", userData);
        // Backend returns user data without tokens
        // User needs to login after registration
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Registration failed");
    }
};

// Logout user
export const logout = async () => {
    try {
        await apiClient.post("/logout");
    } catch (error) {
        // Even if logout fails on server, clear local storage
        console.error("Logout error:", error);
    } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
    }
};

// Update user avatar
export const updateAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await apiClient.patch("/change-avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Avatar update failed"
        );
    }
};

// Update cover image
export const updateCoverImage = async (file) => {
    const formData = new FormData();
    formData.append("coverImage", file);

    try {
        const response = await apiClient.patch(
            "/change-cover-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Cover image update failed"
        );
    }
};

// Initiate Google OAuth (disabled until backend enables it)
export const handleGoogleAuth = () => {
    console.warn("Google OAuth is currently disabled");
    // window.location.href = `${API_BASE_URL}/auth/google`;
};

export { apiClient, publicClient };
