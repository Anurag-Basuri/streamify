import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/users";
const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
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

// Get User Profile (with error handling for missing user data)
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("No authentication token found");
            return null; // Prevents API call if no token is found
        }

        const response = await axiosInstance.get("/current-user");

        // Ensure response structure is valid
        if (!response.data || !response.data.data || !response.data.data.user) {
            console.warn("User data is null or undefined");
            return null; // Prevents errors in AuthContext
        }

        return response.data.data.user;
    } catch (error) {
        console.error("Error fetching user profile:", handleError(error));
        return null; // Ensures graceful failure
    }
};

// User Signup
export const signUp = async (userData) => {
    try {
        const response = await axiosInstance.post("/register", userData);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: handleError(error) };
    }
};

// User Signin
export const signIn = async (credentials) => {
    try {
        const response = await axiosInstance.post("/login", credentials);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: handleError(error) };
    }
};

// Signout
export const logout = () => {
    localStorage.removeItem("token");
    axiosInstance
        .post("/logout")
        .catch((err) => console.error("Logout failed:", handleError(err)));
};

// Check if User is Authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

// Update User Profile
export const updateUser = async (formData) => {
    try {
        const token = localStorage.getItem("token");
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
