import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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

    const handleTokenRefresh = useCallback(async () => {
        if (isTokenRefreshing) return;
        setIsTokenRefreshing(true);

        try {
            const { accessToken, refreshToken: newRefreshToken } =
                await refreshToken();
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            const profile = await getCurrentUser();
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
    }, [isTokenRefreshing, navigate]);

    useEffect(() => {
        let isMounted = true;
        const initializeAuth = async () => {
            try {
                if (localStorage.getItem("accessToken")) {
                    await loadUserProfile();
                } else {
                    setIsLoading(false);
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

    useEffect(() => {
        const checkAuth = async () => {
            const tokenExp = jwtDecode(
                localStorage.getItem("accessToken")
            )?.exp;
            if (tokenExp && tokenExp * 1000 < Date.now() + 300000) {
                await handleTokenRefresh();
            }
        };
        checkAuth();
    }, [user, handleTokenRefresh, isTokenRefreshing]);

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
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    navigate("/auth");
                }
            }
        };

        handleOAuthCallback();
    }, [navigate, location, loadUserProfile]);

    const login = useCallback(
        async (credentials) => {
            try {
                const { accessToken, refreshToken } = await signIn(credentials);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                const profile = await getCurrentUser();
                setUser(profile);
                return true;
            } catch (error) {
                setUser(null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return false;
            }
        },
        [loadUserProfile]
    );

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

    const googleLogin = useCallback(async () => {
        try {
            await handleGoogleAuth();
        } catch (error) {
            console.error("Google login failed:", error);
        }
    }, []);

    const updateUserInContext = useCallback((newUserData) => {
        setUser((prev) => ({ ...prev, ...newUserData }));
    }, []);

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
    children: PropTypes.node.isRequired
};

export { AuthProvider, AuthContext };