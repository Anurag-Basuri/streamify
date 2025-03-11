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
        if (response.data.data?.token) {
            // Updated path
            localStorage.setItem("accessToken", response.data.data.token);
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
        const response = await axiosInstance.get("/current-user");

        // Access user data correctly
        if (!response.data?.data) {
            console.warn("Invalid user data format");
            return null;
        }
        return {
            ...response.data.data, // Directly use data property
            isGoogleUser: !!response.data.data.googleId,
        };
    } catch (error) {
        console.error("Profile fetch error:", handleError(error));
        return null;
    }
};

// Export API functions
export const signIn = async (credentials) => {
    try {
        console.log("Sending request to:", API_BASE_URL + "/login");
        console.log("Request payload:", credentials);

        const response = await axiosInstance.post("/login", credentials);

        console.log("Response received:", response.data);

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

export const signUp = async (userData) => {
    try {
        const response = await axiosInstance.post("/register", userData);
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

        // Get updated user profile
        const user = await getUserProfile();
        if (!user) throw new Error("Failed to fetch user profile");

        return user;
    } catch (error) {
        console.error("OAuth Callback Error:", error);
        throw error;
    }
};

//validation function
const validateApiResponse = (response) => {
    if (!response || !response.data) {
        throw new Error("Invalid API response format");
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
        });

        validateApiResponse(response);
        return response.data.user;
    } catch (error) {
        console.error("Update Profile Error:", handleError(error));
        throw new Error("Failed to update profile");
    }
};