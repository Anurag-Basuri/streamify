/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
import { createContext, useState, useEffect, useCallback } from "react";
import {
    signIn,
    signUp,
    logout,
    getUserProfile,
    refreshToken,
} from "./authService.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);

    // Load user profile and update state
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await getUserProfile();
            console.log("load: ", profile);
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

    // Login function
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { success, data } = await signIn(credentials);
            if (success) {
                console.log("Login successful, loading profile...");
                const profile = await loadUserProfile();
                console.log("Profile loaded:", profile);
                return { success: !!profile };
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
            if (success && data?.token) {
                localStorage.setItem("accessToken", data.token); // Store token
                await loadUserProfile(); // Load user profile
            }
            return { success };
        } catch (error) {
            return { success: false, message: error.message }; // Return error message
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logoutUser = async () => {
        setIsLoading(true);
        try {
            await logout(); // Call logout API
            setUser(null); // Clear user state
            localStorage.removeItem("accessToken"); // Remove token
        } catch (error) {
            console.error("Logout failed:", error.message); // Log error
        } finally {
            setIsLoading(false);
        }
    };

    // Check username availability (placeholder)
    const checkUsername = async (username) => {
        try {
            // Implement username availability check logic here
            return true; // Placeholder
        } catch (error) {
            console.error("Username check failed:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user, // Convert user to boolean
                login,
                register,
                logout: logoutUser,
                checkUsername,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
