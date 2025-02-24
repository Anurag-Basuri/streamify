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

// Update User Profile
export const updateUser = async (formData) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axiosInstance.put(
            "/update-profile",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    } catch (error) {
        throw new Error(handleError(error));
    }
};

// User Signup
export const signUp = async (userData) => {
  try {
      const response = await axiosInstance.post("/register", userData);
      return { success: true, data: response.data };
  } catch (error) {
        throw new Error(handleError(error));
  }
};

// User Signin
export const signIn = async (credentials) => {
    try {
        const response = await axiosInstance.post("/login", credentials);
        return { success: true, data: response.data };
    } catch (error) {
        throw new Error(handleError(error));
    }
};

// Signout
export const logout = () => {
    localStorage.removeItem("token");
    axiosInstance.post("/logout");
};

// Get User Profile
export const getUserProfile = async () => {
  try {
      const response = await axiosInstance.get("/current-user");
      return response.data.data.user;
  } catch (error) {
        throw new Error(handleError(error));
  }
};

// Check if User is Authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};