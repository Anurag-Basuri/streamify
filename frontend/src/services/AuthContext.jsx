import { createContext, useState, useEffect, useCallback } from "react";
import {
    signIn,
    signUp,
    logout,
    getUserProfile,
    isAuthenticated,
} from "./authService.js"; // Import from authService.js

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user profile on mount or auth state change
    const loadUserProfile = useCallback(async () => {
        try {
            const profile = await getUserProfile();
            if (profile) {
                setUser(profile);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to load user profile:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                await loadUserProfile();
            } else {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [loadUserProfile]);

    // Login function
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const data = await signIn(credentials);
    
            if (data.success) {
                console.log("User authenticated successfully. Loading profile...");
                await loadUserProfile(); // Ensure this function is working
            } else {
                console.error("Login failed:", data.message);
            }
    
            return data;
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Login failed. Please try again." };
        } finally {
            setIsLoading(false);
        }
    };
    

    // Register function
    const register = async (userData) => {
        setIsLoading(true);
        try {
            if (!userData.userName || !userData.fullName || !userData.email || !userData.password) {
                throw new Error("All fields are required");
            }
            const data = await signUp(userData);
            await loadUserProfile();
            return data;
        } catch (error) {
            console.error("Registration Error:", error.message);
        } finally {
            setIsLoading(false);
        }
    };
    

    // Logout function
    const logoutUser = () => {
        logout();
        setUser(null);
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
