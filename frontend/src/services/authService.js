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
        console.log("Current Token:", token); // Debug token
        if (!token) {
            console.debug("No authentication token found");
            return null;
        }

        const response = await axiosInstance.get("/current-user", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);

        if (!response.data?.data) {
            console.warn("Invalid user data format");
            return null;
        }
        console.log("xyz", response.data.data.user);
        return "response.data.data.user";
    } catch (error) {
        console.error("Profile fetch error:", error.message);
        return null;
    }
};

// User Signup
export const signUp = async (userData) => {
    try {
        const response = await axiosInstance.post("/register", userData);
        console.log("Register API Response:", response);
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

        console.log("=== Login Response ===");
        console.log("Status:", response.status);
        console.log("Body Data:", response.data);
        console.log("Headers:", response.headers);

        // Store access token from response body
        if (response.data?.data?.accessToken) {
            console.log("Storing access token in localStorage");
            localStorage.setItem("accessToken", response.data.data.accessToken);
        }

        return {
            success: response.data.success,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("=== Login Error ===");
        console.log("Error Response:", error.response?.data);
        return {
            success: false,
            message: error.response?.data?.message || "Login failed",
        };
    }
};

// Signout
export const logout = () => {
    localStorage.removeItem("accessToken");
    axiosInstance
        .post("/logout")
        .catch((err) => console.error("Logout failed:", handleError(err)));
};

// Check if User is Authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
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

        return response.data;
    } catch (error) {
        throw new Error(handleError(error));
    }
};