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

        // Prevent infinite loops on failed refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/refresh-token") &&
            localStorage.getItem("refreshToken") // Only attempt refresh if refreshToken exists
        ) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Clear all auth tokens on refresh failure
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/auth";
                return Promise.reject(refreshError);
            }
        }

        // Reject other errors
        return Promise.reject(error);
    }
);

// Named Exports for API Functions
export const getCurrentUser = async () => {
  try {
      const response = await apiClient.get("/current-user");
      return response.data.data;
  } catch (error) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch user"
      );
  }
};

export const signIn = async (credentials) => {
    try {
        const response = await apiClient.post("/login", credentials);
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Login failed");
    }
};

export const signUp = async (userData) => {
    try {
        const response = await apiClient.post("/register", userData);
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Registration failed");
    }
};

export const logout = async () => {
    try {
        await apiClient.post("/logout");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
        throw new Error(
            error.response?.data?.message || "Avatar update failed"
        );
    }
};

export const updateCoverImage = async (file) => {
    const formData = new FormData();
    formData.append("coverImage", file);

    try {
        const response = await apiClient.patch(
            "/change-cover-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Cover image update failed"
        );
    }
};

export const handleGoogleAuth = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
};

export const refreshToken = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
            refreshToken: localStorage.getItem("refreshToken"),
        });
        const newToken = response.data.data?.token;

        if (newToken) {
            localStorage.setItem("accessToken", newToken);
            return newToken;
        }
        throw new Error("No token received");
    } catch (error) {
        console.error("Token refresh failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw error;
    }
};