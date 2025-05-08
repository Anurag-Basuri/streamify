import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import {
    getCurrentUser,
    signIn,
    signUp,
    logout,
    refreshToken,
    handleGoogleAuth,
} from "../services/authService";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const intervalRef = useRef(null);

    // Load user profile
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await getCurrentUser();
            setUser(profile);
            return profile;
        } catch (error) {
            console.error("Failed to load user profile:", error);
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh access token
    const handleTokenRefresh = useCallback(async () => {
        if (isTokenRefreshing) return;
        setIsTokenRefreshing(true);

        try {
            const { accessToken, refreshToken: newRefreshToken } =
                await refreshToken();
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            const profile = await loadUserProfile();
            setUser(profile);
            return true;
        } catch (error) {
            console.error("Token refresh failed:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/auth", { state: { sessionExpired: true } });
            return false;
        } finally {
            setIsTokenRefreshing(false);
        }
    }, [isTokenRefreshing, navigate, loadUserProfile]);

    // Initialize authentication
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                    const tokenExp = jwtDecode(accessToken)?.exp;
                    if (tokenExp && tokenExp * 1000 > Date.now()) {
                        await loadUserProfile();
                    } else {
                        await handleTokenRefresh();
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Initialization error:", error);
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
    }, [navigate, loadUserProfile, handleTokenRefresh]);

    // Periodically check token expiration
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                const tokenExp = jwtDecode(accessToken)?.exp;
                if (tokenExp && tokenExp * 1000 < Date.now() + 300000) {
                    await handleTokenRefresh();
                }
            }
        };

        const interval = setInterval(checkAuth, 300000); // Check every 5 minutes
        return () => clearInterval(interval);
    }, [handleTokenRefresh]);

    // Handle OAuth callback
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
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );
                } catch (error) {
                    console.error("OAuth callback error:", error);
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    navigate("/auth");
                }
            }
        };

        handleOAuthCallback();
    }, [navigate, location, loadUserProfile]);

    // Login user
    const login = useCallback(
        async (credentials) => {
            try {
                const { accessToken, refreshToken } = await signIn(credentials);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                const profile = await loadUserProfile();
                setUser(profile);
                return true;
            } catch (error) {
                console.error("Login error:", error);
                setUser(null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return false;
            }
        },
        [loadUserProfile]
    );

    // Register user
    const register = useCallback(
        async (userData) => {
            try {
                const { accessToken, refreshToken } = await signUp(userData);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                await loadUserProfile();
                return true;
            } catch (error) {
                console.error("Registration error:", error);
                return false;
            }
        },
        [loadUserProfile]
    );

    // Logout user
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

    // Google login
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

    // Memoized context value
    const authContextValue = useMemo(
        () => ({
            user,
            isLoading: isLoading || !isInitialized,
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
            isInitialized,
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

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AuthProvider, AuthContext };