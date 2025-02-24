import { createContext, useState, useEffect, useCallback } from "react";
import { signIn, signUp, logout, getUserProfile } from "./authService.js";

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user profile on mount or auth state change
    const loadUserProfile = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

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
            const data = await signIn(credentials);
            if (data.success) {
                await loadUserProfile();
            }
            return data;
        } catch (error) {
            setUser(null);
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        setIsLoading(true);
        try {
            const data = await signUp(userData);
            if (data.success) {
                await loadUserProfile();
            }
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logoutUser = () => {
        logout();
        setUser(null);
        setIsLoading(false);
        window.location.href = "/";
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export { AuthProvider, AuthContext };
