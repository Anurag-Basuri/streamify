import { Routes, Route } from "react-router-dom";
import Home from "../pages/Display/Home.jsx";
import Profile from "../pages/You/Profile.jsx";
import SignInAndUp from "../pages/You/SignInAndUp.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<SignInAndUp />} />
        </Routes>
    );
};

export default AppRoutes;
