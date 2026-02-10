import { memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";

const ProtectedRoute = memo(
    ({
        children,
        requireAuth = true,
        allowedRoles = [],
        redirectPath = "/auth",
    }) => {
        const { isAuthenticated, isLoading, user } = useAuth();
        const location = useLocation();

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            );
        }

        // Handle authentication check
        if (requireAuth && !isAuthenticated) {
            const redirectUrl = `${redirectPath}?redirect=${encodeURIComponent(
                location.pathname
            )}`;
            return <Navigate to={redirectUrl} replace />;
        }

        // Handle role-based access
        if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
            return <Navigate to="/unauthorized" replace />;
        }

        // Handle already authenticated users trying to access auth pages
        if (!requireAuth && isAuthenticated) {
            return <Navigate to="/dashboard" replace />;
        }

        return children;
    }
);

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requireAuth: PropTypes.bool,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
    redirectPath: PropTypes.string,
};

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
