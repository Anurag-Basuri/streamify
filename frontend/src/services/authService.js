import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/users";
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to inject tokens
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
        const response = await axiosInstance.post("/refresh-token");
        if (response.data?.token) {
            localStorage.setItem("accessToken", response.data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Token refresh failed:", handleError(error));
        return false;
    }
};

// Get User Profile
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.debug("No authentication token found");
            return null;
        }

        const response = await axiosInstance.get("/current-user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data?.data?.user) {
            console.warn("Invalid user data format");
            return null;
        }

        const userData = response.data.data.user;
        return {
            ...userData,
            isGoogleUser: !!userData.googleId, // Add Google user flag
        };
    } catch (error) {
        console.error("Profile fetch error:", handleError(error));
        return null;
    }
};

// User Signup
export const signUp = async (userData) => {
    try {
        const response = await axiosInstance.post("/register", userData);
        return {
            success: true,
            data: response.data,
            message: response.data?.message,
        };
    } catch (error) {
        const message = handleError(error);
        console.error("Registration Error:", message, error);
        return {
            success: false,
            message,
        };
    }
};

// User Signin
export const signIn = async (credentials) => {
    try {
        const response = await axiosInstance.post("/login", credentials, {
            withCredentials: true, // Enable cookie handling
        });

        // Store access token from response body
        if (response.data?.data?.accessToken) {
            localStorage.setItem("accessToken", response.data.data.accessToken);
        }

        return {
            success: response.data.success,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("Login Error:", handleError(error));
        return {
            success: false,
            message: error.response?.data?.message || "Login failed",
        };
    }
};

// Signout
export const logout = async () => {
    try {
        await axiosInstance.post("/logout");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    } catch (error) {
        console.error("Logout failed:", handleError(error));
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

export const handleOAuthCallback = async (accessToken, refreshToken) => {
    try {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        return await getUserProfile();
    } catch (error) {
        console.error("OAuth Callback Error:", handleError(error));
        throw new Error("Failed to complete OAuth login");
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
                "Content-Type": "multipart/form-data", // Required for file uploads
            },
        });

        return response.data;
    } catch (error) {
        console.error("Update Profile Error:", handleError(error));
        throw new Error("Failed to update profile");
    }
};