/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    signIn,
    signUp,
    logout,
    getUserProfile,
    refreshToken,
    handleGoogleAuth,
} from "./authService.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Load user profile and update state
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await getUserProfile();
            setUser(profile); // Update user state
            return profile; // Return profile for verification
        } catch (error) {
            setUser(null); // Clear user state on error
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle token refresh
    const handleTokenRefresh = useCallback(async () => {
        if (!isTokenRefreshing) {
            setIsTokenRefreshing(true);
            try {
                await refreshToken(); // Refresh the token
                await loadUserProfile(); // Reload user profile
            } catch (error) {
                setUser(null); // Clear user state if refresh fails
            } finally {
                setIsTokenRefreshing(false);
            }
        }
    }, [isTokenRefreshing, loadUserProfile]);

    // Check authentication state on mount and set up token refresh
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await loadUserProfile(); // Load user profile on mount
            } catch (error) {
                await handleTokenRefresh(); // Attempt token refresh if profile load fails
            }
        };

        checkAuth(); // Initial check
        const interval = setInterval(() => {
            handleTokenRefresh(); // Refresh token every 5 minutes
        }, 300000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [handleTokenRefresh, loadUserProfile]);

    // Handle OAuth callback on initial load
    useEffect(() => {
        const checkOAuthCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("access");
            const refreshToken = params.get("refresh");

            if (accessToken && refreshToken) {
                try {
                    // Clear existing tokens
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");

                    // Store new tokens
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);

                    // Force reload user data
                    const user = await loadUserProfile();
                    navigate(location.state?.from || "/profile");
                } catch (error) {
                    console.error("OAuth callback failed:", error);
                    navigate("/auth");
                }
            }
        };
        checkOAuthCallback();
    }, [navigate, location]);

    // check auth state
    useEffect(() => {
        const checkAuthState = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (token) {
                    await loadUserProfile();
                }
            } catch (error) {
                localStorage.removeItem("accessToken");
                setUser(null);
            }
        };
        checkAuthState();
    }, []);

    // Login function
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { success, data } = await signIn(credentials);
            if (success && data?.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
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
                localStorage.setItem("accessToken", data.accessToken);
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

    // Logout function
    const logoutUser = async () => {
        setIsLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error.message);
        } finally {
            setIsLoading(false);
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
