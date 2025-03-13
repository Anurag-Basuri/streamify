import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    signIn,
    signUp,
    logout,
    getCurrentUser,
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
    const intervalRef = useRef(null);

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
        if (!user || isTokenRefreshing) return;

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

    // Auth initialization
    useEffect(() => {
        let isMounted = true;
        const initializeAuth = async () => {
            try {
                await loadUserProfile();
                if (isMounted) {
                    intervalRef.current = setInterval(
                        handleTokenRefresh,
                        300000
                    );
                }
            } catch (error) {
                if (isMounted) setUser(null);
            }
        };

        initializeAuth();
        return () => {
            isMounted = false;
            clearInterval(intervalRef.current);
        };
    }, [handleTokenRefresh, loadUserProfile]);

    // OAuth callback handler
    useEffect(() => {
        const handleOAuthCallback = async () => {
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
                    navigate("/auth");
                }
            }
        };
        handleOAuthCallback();
    }, [navigate, location, loadUserProfile]);

    // Login function
    const login = useCallback(
        async (credentials) => {
            try {
                const { success, data } = await signIn(credentials);
                if (success && data?.accessToken) {
                    await loadUserProfile();
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        [loadUserProfile]
    );

    // Register function
    const register = useCallback(
        async (userData) => {
            try {
                const { success, data } = await signUp(userData);
                if (success && data?.accessToken) {
                    await loadUserProfile();
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        [loadUserProfile]
    );

    // Logout function
    const logoutUser = useCallback(async () => {
        try {
            await logout();
            setUser(null);
            clearInterval(intervalRef.current);
            navigate("/auth");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }, [navigate]);

    // Google login function
    const googleLogin = useCallback(async () => {
        try {
            await handleGoogleAuth();
        } catch (error) {
            console.error("Google login failed:", error);
        }
    }, []);

    // Update user in context
    const updateUserInContext = useCallback((newUserData) => {
        setUser((prev) => ({ ...prev, ...newUserData }));
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const authContextValue = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout: logoutUser,
            googleLogin,
            updateUserInContext,
        }),
        [
            user,
            isLoading,
            login,
            register,
            logoutUser,
            googleLogin,
            updateUserInContext,
        ]
    );

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
