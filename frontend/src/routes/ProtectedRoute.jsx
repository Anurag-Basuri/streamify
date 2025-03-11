import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import Spinner from "../components/Spinner"; // Add a proper loading spinner component

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <Spinner />;

    return isAuthenticated ? (
        children
    ) : (
        <Navigate
            to={`/auth?mode=login&redirect=${encodeURIComponent(
                location.pathname + location.search
            )}`}
            replace
        />
    );
};

export default ProtectedRoute;
