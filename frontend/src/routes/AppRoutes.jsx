import { Routes, Route } from "react-router-dom";
import Home from "../pages/Display/Home.jsx";
import Profile from "../pages/You/Profile.jsx";
import AuthPage from "../pages/You/AuthPage.jsx";
import Tweet from "../pages/Display/Tweet.jsx";
import Subscription from "../pages/Display/Subscription.jsx";
import History from "../pages/Account/History.jsx";
import Download from "../pages/Account/Download.jsx";
import Playlist from "../pages/Account/Playlist.jsx";
import Watchlater from "../pages/Account/Watchlater.jsx";
import YourVideos from "../pages/Account/YourVideos.jsx";
import Create from "../pages/You/Create.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/tweet" element={<Tweet />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/history" element={<History />} />
            <Route path="/download" element={<Download />} />
            <Route path="/playlist" element={<Playlist />} />
            <Route path="/watchlater" element={<Watchlater />} />
            <Route path="/uservideos" element={<YourVideos />} />
            <Route path="/create" element={<Create />} />
        </Routes>
    );
};

export default AppRoutes;
