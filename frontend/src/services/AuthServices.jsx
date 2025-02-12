import { createContext, useState, useEffect } from "react";
import {
    signIn,
    signUp,
    logout,
    getUserProfile,
    isAuthenticated,
} from "../services/authService.js";

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if a token exists and set the authenticated state
        if (isAuthenticated()) {
            setIsAuthenticatedState(true);
            loadUserProfile();
        }
    }, []);

    const loadUserProfile = async () => {
        const profile = await getUserProfile();
        setUser(profile);
    };

    const login = async (credentials) => {
        // eslint-disable-next-line no-useless-catch
        try {
            const data = await signIn(credentials);
            setIsAuthenticatedState(true);
            loadUserProfile();
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        // eslint-disable-next-line no-useless-catch
        try {
            const data = await signUp(userData);
            setIsAuthenticatedState(true);
            loadUserProfile();
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logoutUser = () => {
        logout();
        setIsAuthenticatedState(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticatedState, user, login, register, logoutUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export { AuthProvider, AuthContext };
