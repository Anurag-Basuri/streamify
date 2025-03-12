import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/users";

// Create Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to inject tokens
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Cancel token source for aborting requests
let cancelTokenSource = axios.CancelToken.source();

// Helper function for error handling
const handleError = (error) => {
    console.error("API Error:", error);
    if (error.response) {
        return (
            error.response.data?.message ||
            error.response.data?.error ||
            "An error occurred"
        );
    }
    return error.message || "Network Error";
};

// Refresh token function
export const refreshToken = async () => {
    try {
        const response = await axiosInstance.post("/refresh-token", null, {
            cancelToken: cancelTokenSource.token,
        });
        if (response.data.data?.token) {
            localStorage.setItem("accessToken", response.data.data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Token refresh failed:", handleError(error));
        return false;
    }
};

// Cancel all pending requests
export const cancelAllRequests = () => {
    cancelTokenSource.cancel("User logged out");
    cancelTokenSource = axios.CancelToken.source(); // Reset
};

// Get User Profile
export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get("/current-user", {
            cancelToken: cancelTokenSource.token,
        });
        if (!response.data?.data) {
            throw new Error("Invalid user data format");
        }
        return {
            ...response.data.data,
            isGoogleUser: !!response.data.data.googleId,
        };
    } catch (error) {
        console.error("Profile fetch error:", error);
        throw new Error(handleError(error));
    }
};

// Sign-In
export const signIn = async (credentials) => {
    try {
        const response = await axiosInstance.post("/login", credentials, {
            cancelToken: cancelTokenSource.token,
        });

        if (response.data.data?.accessToken) {
            localStorage.setItem("accessToken", response.data.data.accessToken);
        }

        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("Login Error:", error);
        return {
            success: false,
            message: handleError(error),
        };
    }
};

// Sign-Up
export const signUp = async (userData) => {
    try {
        const response = await axiosInstance.post("/register", userData, {
            cancelToken: cancelTokenSource.token,
        });
        if (response.data.data?.accessToken) {
            localStorage.setItem("accessToken", response.data.data.accessToken);
        }
        return {
            success: true,
            data: response.data.data.user,
            message: "Registration successful",
        };
    } catch (error) {
        return {
            success: false,
            message: handleError(error),
        };
    }
};

// Sign-out
export const logout = async () => {
    try {
        await axiosInstance.post("/logout"); // Call backend logout endpoint
        localStorage.removeItem("accessToken"); // Clear localStorage
        localStorage.removeItem("refreshToken");

        // Clear cookies (if used)
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

// Check if User is Authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
};

// Google OAuth Functions
export const handleGoogleAuth = async () => {
    try {
        window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
        console.error("Google Auth Error:", handleError(error));
        throw new Error("Failed to initiate Google login");
    }
};

// Update User Profile
export const updateUser = async (formData) => {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axiosInstance.put("/update-profile", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            cancelToken: cancelTokenSource.token,
        });

        if (!response || !response.data) {
            throw new Error("Invalid API response format");
        }
        return response.data.user;
    } catch (error) {
        console.error("Update Profile Error:", handleError(error));
        throw new Error("Failed to update profile");
    }
};

// Update Avatar
export const updateAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await axiosInstance.patch("/change-avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            cancelToken: cancelTokenSource.token,
        });
        return response.data;
    } catch (error) {
        throw new Error(handleError(error));
    }
};

// Update Cover Image
export const updateCoverImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append("coverImage", file);

        const response = await axiosInstance.patch(
            "/change-cover-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                cancelToken: cancelTokenSource.token,
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleError(error));
    }
};