import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import Spinner from "../components/Spinner";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext);
    const location = useLocation();

    // Add debug logs
    console.log("Protected Route Check:", {
        isAuthenticated,
        loading,
        user,
        path: location.pathname,
    });

    if (loading) {
        return <Spinner />;
    }

    if (!isAuthenticated) {
        // Preserve the entire URL (pathname + search params)
        const redirectUrl = location.pathname + location.search;
        return (
            <Navigate
                to={`/auth?mode=login&redirect=${encodeURIComponent(
                    redirectUrl
                )}`}
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;
