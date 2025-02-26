import axios from "axios";

// Create an Axios instance with base URL and credentials
const axiosInstance = axios.create({
    baseURL: "/api/v1/users", // Proxy to backend
    withCredentials: true, // Enable cookies
});

// Helper function for error handling
const handleError = (error) => {
  console.error("API Error:", error);
  if (error.response) {
      return error.response.data?.message || "An error occurred";
  }
  return error.message || "Network Error";
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

// User Login
export const signIn = async (credentials) => {
    try {
        const response = await axiosInstance.post("/login", credentials);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: handleError(error) };
    }
};

// User Logout
export const logout = async () => {
    try {
        await axiosInstance.post("/logout");
        return { success: true };
    } catch (error) {
        return { success: false, message: handleError(error) };
    }
};

// Get User Profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/current-user");
    return response.data?.data?.user || null;
  } catch (error) {
    console.error("Error fetching profile:", handleError(error));
    return null;
  }
};

// Check if User is Authenticated
export const isAuthenticated = async () => {
    try {
        const response = await axiosInstance.get("/current-user");
        return !!response.data?.data?.user;
    } catch (error) {
        return false;
    }
};

// Update User Profile
export const updateUser = async (formData) => {
  try {
      const response = await axiosInstance.put("/update-profile", formData, {
          headers: {
              "Content-Type": "multipart/form-data", // For file uploads
          },
      });
      return { success: true, data: response.data };
  } catch (error) {
      return { success: false, message: handleError(error) };
  }
};