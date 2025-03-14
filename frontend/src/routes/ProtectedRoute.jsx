import { memo, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import Spinner from "../components/Spinner";

const ProtectedRoute = memo(({ children }) => {
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const location = useLocation();

    if (isLoading) return <Spinner />;

    // Wait for user initialization to complete
    if (!user && !isAuthenticated) {
        return (
            <Navigate
                to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return children;
});

ProtectedRoute.displayName = "ProtectedRoute";
export default ProtectedRoute;
