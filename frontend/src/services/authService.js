import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/users";
const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Utility function to get token
const getToken = () => localStorage.getItem("token");

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

// User Signup
export const signUp = async (userData) => {
    try {
        const formData = new FormData();

        // Append all fields correctly
        Object.entries(userData).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value);
            }
        });

        console.log("Form Data Sent:", [...formData.entries()]); // Debugging log

        const response = await axiosInstance.post("/register", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        return handleError(error);
    }
};

// User Signin
export const signIn = async (credentials) => {
    try {
        console.log("📤 Sending login request:", credentials);
        console.log("🔧 Axios Config:", axiosInstance.defaults);

        const response = await axiosInstance.post("/login", credentials);

        console.log("✅ Login response received:", response);

        if (response.status === 200 && response.data.accessToken) {
            localStorage.setItem("token", response.data.accessToken);
            console.log("🔑 Token saved.");
            return { success: true, data: response.data };
        } else {
            console.error("❌ Unexpected response:", response.data);
            return { success: false, message: "Invalid credentials" };
        }
    } catch (error) {
        console.error("🚨 Login request failed:", error.response?.data || error.message);
        return { success: false, message: error.message };
    }
};

// Signout
export const logout = () => {
    localStorage.removeItem("token");
};

// Get User Profile
export const getUserProfile = async () => {
    try {
        const response = await axiosInstance.get("/current-user", {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        console.log("User profile response:", response.data);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            logout();
            return null;
        }
        return handleError(error);
    }
};

// Fetch Watch History
export const getWatchHistory = async (page = 1, limit = 10) => {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await axios.get(`${API_BASE_URL}/watch-history`, {
            params: { page, limit },
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error) {
        return handleError(error);
    }
};

// Check if User is Authenticated
export const isAuthenticated = () => !!getToken();

// Update User Profile
export const updateUser = async (userData) => {
    try {
        const token = getToken();
        if (!token) return null;

        const formData = new FormData();
        if (userData.avatar instanceof File)
            formData.append("avatar", userData.avatar);
        if (userData.coverImage instanceof File)
            formData.append("coverImage", userData.coverImage);

        Object.keys(userData).forEach((key) => {
            if (key !== "avatar" && key !== "coverImage") {
                formData.append(key, userData[key]);
            }
        });

        const response = await axios.put(
            `${API_BASE_URL}/update-profile`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log("Update user response:", response.data);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: handleError(error) };
    }
};
