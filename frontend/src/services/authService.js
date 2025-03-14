import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/users";

// Create Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await apiClient.post("/refresh-token");
        const newToken = refreshResponse.data.data?.token;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        window.location.href = "/auth"; // Redirect to login on token refresh failure
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Named Exports for API Functions
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/current-user");
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};

export const signIn = async (credentials) => {
  try {
    const response = await apiClient.post("/login", credentials);
    localStorage.setItem("accessToken", response.data.data.accessToken);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const signUp = async (userData) => {
  try {
    const response = await apiClient.post("/register", userData);
    localStorage.setItem("accessToken", response.data.data.accessToken);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const logout = async () => {
  try {
    await apiClient.post("/logout");
    localStorage.removeItem("accessToken");
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};

export const updateAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const response = await apiClient.patch("/change-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Avatar update failed");
  }
};

export const updateCoverImage = async (file) => {
  const formData = new FormData();
  formData.append("coverImage", file);

  try {
    const response = await apiClient.patch("/change-cover-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Cover image update failed");
  }
};

export const handleGoogleAuth = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post("/refresh-token");
    const newToken = response.data.data?.token;

    if (newToken) {
      localStorage.setItem("accessToken", newToken);
      return newToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("accessToken");
    throw new Error(error.response?.data?.message || "Token refresh failed");
  }
};
