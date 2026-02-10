import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
    getCurrentUser,
    signIn,
    signUp,
    logout as logoutApi,
    handleGoogleAuth,
    TokenService,
} from "../services/authService";

// Create context
const AuthContext = createContext(null);

// Auth states
const AUTH_STATES = {
    LOADING: "loading",
    AUTHENTICATED: "authenticated",
    UNAUTHENTICATED: "unauthenticated",
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Load user profile
    const loadUserProfile = useCallback(async () => {
        try {
            const profile = await getCurrentUser();
            setUser(profile);
            setAuthState(AUTH_STATES.AUTHENTICATED);
            return profile;
        } catch (error) {
            console.error("Failed to load user profile:", error);
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            throw error;
        }
    }, []);

    // Handle session expiration (from API interceptor)
    useEffect(() => {
        const handleSessionExpired = () => {
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            toast.error("Your session has expired. Please login again.");
            navigate("/auth?mode=login", {
                state: { from: location.pathname, sessionExpired: true },
            });
        };

        window.addEventListener("auth:sessionExpired", handleSessionExpired);
        return () => {
            window.removeEventListener(
                "auth:sessionExpired",
                handleSessionExpired
            );
        };
    }, [navigate, location.pathname]);

    // Initialize authentication on mount
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            const accessToken = TokenService.getAccessToken();

            if (!accessToken) {
                if (isMounted) {
                    setAuthState(AUTH_STATES.UNAUTHENTICATED);
                    setIsLoading(false);
                }
                return;
            }

            // Check if token is expired
            if (TokenService.isTokenExpired(accessToken)) {
                // Try to refresh
                try {
                    await loadUserProfile();
                } catch {
                    TokenService.clearTokens();
                    if (isMounted) {
                        setAuthState(AUTH_STATES.UNAUTHENTICATED);
                    }
                }
            } else {
                // Token is valid, load profile
                try {
                    await loadUserProfile();
                } catch {
                    if (isMounted) {
                        setAuthState(AUTH_STATES.UNAUTHENTICATED);
                    }
                }
            }

            if (isMounted) {
                setIsLoading(false);
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, [loadUserProfile]);

    // Handle OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access");
        const refreshToken = params.get("refresh");

        if (accessToken && refreshToken) {
            TokenService.setTokens(accessToken, refreshToken);
            loadUserProfile()
                .then(() => {
                    navigate(location.state?.from || "/profile", {
                        replace: true,
                    });
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );
                })
                .catch((error) => {
                    console.error("OAuth callback error:", error);
                    TokenService.clearTokens();
                    navigate("/auth?mode=login");
                });
        }
    }, [navigate, location, loadUserProfile]);

    // Login user
    const login = useCallback(
        async (credentials) => {
            setIsLoading(true);
            try {
                const { user: userData } = await signIn(credentials);
                await loadUserProfile();
                toast.success(`Welcome back, ${userData?.fullName || "User"}!`);
                return true;
            } catch (error) {
                const message =
                    error.message || "Login failed. Please try again.";
                toast.error(message);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [loadUserProfile]
    );

    // Register user
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        try {
            const result = await signUp(userData);
            toast.success(result.message);
            return result;
        } catch (error) {
            const message =
                error.message || "Registration failed. Please try again.";
            toast.error(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout user
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await logoutApi();
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            toast.success("Logged out successfully");
            navigate("/auth?mode=login");
        } catch (error) {
            console.error("Logout error:", error);
            // Still clear local state even if API fails
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            navigate("/auth?mode=login");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    // Google login
    const googleLogin = useCallback(() => {
        handleGoogleAuth();
    }, []);

    // Update user in context
    const updateUser = useCallback((updates) => {
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
    }, []);

    // Memoized context value
    const contextValue = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: authState === AUTH_STATES.AUTHENTICATED,
            authState,
            login,
            register,
            logout,
            googleLogin,
            updateUser,
            refreshProfile: loadUserProfile,
        }),
        [
            user,
            isLoading,
            authState,
            login,
            register,
            logout,
            googleLogin,
            updateUser,
            loadUserProfile,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AuthProvider, AuthContext, AUTH_STATES };