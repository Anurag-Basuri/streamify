import { Routes, Route } from "react-router-dom";
import Home from "../pages/Display/Home.jsx";
import Profile from "../pages/You/Profile.jsx";
import AuthPage from "../pages/You/AuthPage.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<AuthPage />} />
        </Routes>
    );
};

export default AppRoutes;
