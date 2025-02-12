import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/users";

// Utility function to get token
const getToken = () => localStorage.getItem("token");

// Helper function for error handling
const handleError = (error) => {
    if (error.response) {
        return error.response?.data || "An error occurred";
    }
    return "Network Error";
};

// User Signup
export const signUp = async (userData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/register`,
            userData,
            {
                headers: {
                    "Content-Type": "multipart/form-data", // For file uploads
                },
            }
        );
        return response.data; // Return token or user data
    } catch (error) {
        throw handleError(error);
    }
};

// User Login
export const signIn = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, credentials);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Logout User
export const logout = () => {
    localStorage.removeItem("token");
};

// Get User Profile
export const getUserProfile = async () => {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await axios.get(`${API_BASE_URL}/current-user`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Handle token expiry (401 Unauthorized)
        if (response.status === 401) {
            logout(); // Optional: Clear invalid token and redirect to login
            return null;
        }

        return response.data;
    } catch (error) {
        return handleError(error);
    }
};

// Fetch Watch History (Updated)
export const getWatchHistory = async (page = 1, limit = 10) => {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await axios.get(`${API_BASE_URL}/watch-history`, {
            params: { page, limit },
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data; // Return watch history with pagination info
    } catch (error) {
        return handleError(error);
    }
};

// Check if User is Authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Update User Profile
export const updateUser = async (userData) => {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await axios.put(
            `${API_BASE_URL}/update-profile`,
            userData,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return response.data; // Return updated user data
    } catch (error) {
        return handleError(error);
    }
};
