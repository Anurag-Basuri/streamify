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
    getCurrentUser,
    signIn,
    signUp,
    logout,
    refreshToken,
    handleGoogleAuth,
} from "./authService.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // Track initialization
    const navigate = useNavigate();
    const location = useLocation();
    const intervalRef = useRef(null);

    // Load user profile and update state
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await getCurrentUser();
            console.log("User profile loaded:", profile); // Log profile
            setUser(profile);
            return profile;
        } catch (error) {
            console.error("Failed to load user profile:", error); // Log error
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false); // Ensure this is called
        }
    }, []);

    // Handle token refresh
    const handleTokenRefresh = useCallback(async () => {
        if (isTokenRefreshing) return;

        setIsTokenRefreshing(true);
        try {
            const newToken = await refreshToken();
            const profile = await getCurrentUser();
            setUser(profile);
        } catch (error) {
            setUser(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/auth"); // Redirect to login on refresh failure
        } finally {
            setIsTokenRefreshing(false);
        }
    }, [isTokenRefreshing, navigate]);

    // Auth initialization
    useEffect(() => {
        let isMounted = true;
        const initializeAuth = async () => {
            try {
                if (localStorage.getItem("accessToken")) {
                    await loadUserProfile(); // This handles isLoading internally
                } else {
                    setIsLoading(false); // No token, stop loading immediately
                }
            } catch (error) {
                if (isMounted) {
                    setUser(null);
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    navigate("/auth");
                }
            } finally {
                if (isMounted) setIsInitialized(true);
            }
        };

        initializeAuth();
        return () => {
            isMounted = false;
        };
    }, [navigate, loadUserProfile]);

    // Token refresh interval
    useEffect(() => {
        if (user) {
            intervalRef.current = setInterval(handleTokenRefresh, 300000); // Refresh every 5 minutes
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [user, handleTokenRefresh]);

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

                    // Clear OAuth params from URL
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );
                } catch (error) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    navigate("/auth"); // Redirect to login on OAuth failure
                }
            }
        };

        handleOAuthCallback();
    }, [navigate, location, loadUserProfile]);

    // Login function
    const login = useCallback(
        async (credentials) => {
            try {
                const { accessToken, refreshToken } = await signIn(credentials);
                console.log("Sign-in successful. Tokens:", {
                    accessToken,
                    refreshToken,
                }); // Log tokens
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                await loadUserProfile();
                console.log("Login successful. User:", user); // Log user
                return true;
            } catch (error) {
                console.error("Login failed:", error); // Log error
                setUser(null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return false;
            }
        },
        [loadUserProfile, user]
    );

    // Register function
    const register = useCallback(
        async (userData) => {
            try {
                const { accessToken, refreshToken } = await signUp(userData);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                await loadUserProfile();
                return true;
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
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
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
            isLoading: isLoading || !isInitialized, // Track initialization status
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
            isInitialized, // Add isInitialized to dependencies
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