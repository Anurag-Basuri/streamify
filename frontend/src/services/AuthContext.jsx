import { createContext, useState, useEffect, useCallback } from "react";
import {
    signIn,
    signUp,
    logout,
    getUserProfile,
    isAuthenticated,
} from "./authService";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user profile on mount or auth state change
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await getUserProfile();
            setUser(profile);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    // Login function
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { success } = await signIn(credentials);
            if (success) await loadUserProfile();
            return { success };
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
            const { success } = await signUp(userData);
            if (success) await loadUserProfile();
            return { success };
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

    // Check if user is authenticated
    const checkAuth = async () => {
        return await isAuthenticated();
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
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };