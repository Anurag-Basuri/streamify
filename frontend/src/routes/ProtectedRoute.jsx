import { memo, useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import Spinner from "../components/Spinner";

const ProtectedRoute = memo(({ children }) => {
    const { isAuthenticated, isLoading } = useContext(AuthContext);
    const location = useLocation();
    const previousPath = useRef(location.pathname);

    useEffect(() => {
        if (location.pathname !== previousPath.current) {
            console.log("Route changed to:", location.pathname);
            previousPath.current = location.pathname;
        }
    }, [location.pathname]);

    if (isLoading) return <Spinner />;

    return isAuthenticated ? (
        children
    ) : (
        <Navigate
            to={`/auth?redirect=${encodeURIComponent(
                location.pathname + location.search
            )}`}
            replace
        />
    );
});

ProtectedRoute.displayName = "ProtectedRoute";
export default ProtectedRoute;
