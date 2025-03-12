import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    signIn,
    signUp,
    logout,
    getCurrentUser,
    refreshToken,
    handleGoogleAuth,
    cancelAllRequests,
} from "./authService.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const intervalRef = useRef();

    // Load user profile and update state
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await getCurrentUser();
            setUser(profile);
            return profile;
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle token refresh
    const handleTokenRefresh = useCallback(async () => {
        if (!user || isTokenRefreshing) return; // Skip if no user or already refreshing

        setIsTokenRefreshing(true);
        try {
            await refreshToken();
            await loadUserProfile();
        } catch (error) {
            setUser(null);
        } finally {
            setIsTokenRefreshing(false);
        }
    }, [user, isTokenRefreshing, loadUserProfile]);

    // Check authentication state on mount and set up token refresh
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await loadUserProfile();
            } catch (error) {
                await handleTokenRefresh();
            }
        };

        checkAuth();
        intervalRef.current = setInterval(() => {
            handleTokenRefresh();
        }, 300000); // Refresh token every 5 minutes

        return () => clearInterval(intervalRef.current);
    }, [handleTokenRefresh, loadUserProfile]);

    // Handle OAuth callback on initial load
    useEffect(() => {
        const checkOAuthCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("access");
            const refreshToken = params.get("refresh");

            if (accessToken && refreshToken) {
                try {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                    await loadUserProfile();
                    navigate(location.state?.from || "/profile");
                } catch (error) {
                    console.error("OAuth callback failed:", error);
                    navigate("/auth");
                }
            }
        };
        checkOAuthCallback();
    }, [navigate, location]);

    // Login function
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { success, data } = await signIn(credentials);
            if (success && data?.accessToken) {
                const profile = await loadUserProfile();
                return { success: !!profile, user: profile };
            }
            return { success: false };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        setIsLoading(true);
        try {
            const { success, data } = await signUp(userData);
            if (success && data?.accessToken) {
                const profile = await loadUserProfile();
                return { success: true, user: profile };
            }
            return { success: false };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };
    let refreshInterval;

    const startTokenRefresh = () => {
        refreshInterval = setInterval(async () => {
            try {
                await refreshToken();
            } catch (error) {
                console.error("Token refresh failed:", error);
                clearInterval(refreshInterval); // Stop refreshing if it fails
            }
        }, 300000); // Refresh every 5 minutes
    };
    // Logout function
    const logoutUser = async () => {
        try {
            await logout(); // Call the logout function
            clearInterval(refreshInterval); // Clear the refresh interval
            navigate("/auth"); // Redirect to login page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Google login function
    const googleLogin = async () => {
        try {
            await handleGoogleAuth();
        } catch (error) {
            console.error("Google login failed:", error);
        }
    };

    // Update user in context
    const updateUserInContext = (newUserData) => {
        setUser((prev) => ({ ...prev, ...newUserData }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout: logoutUser,
                googleLogin,
                updateUserInContext,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
