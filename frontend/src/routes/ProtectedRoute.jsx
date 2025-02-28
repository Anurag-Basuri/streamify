/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return isAuthenticated ? (
        children
    ) : (
        <Navigate
            to={`/auth?mode=login&redirect=${encodeURIComponent(
                location.pathname
            )}`}
        />
    );
};

export default ProtectedRoute;