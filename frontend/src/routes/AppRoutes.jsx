import { Routes, Route } from "react-router-dom";
import Home from "../pages/Display/Home.jsx";
import Profile from "../pages/You/Profile.jsx";
import SignInAndUp from "../pages/You/SignInAndUp.jsx";
import Tweet from "../pages/Display/Tweet.jsx";
import Subscription from "../pages/Display/Subscription.jsx";
import History from "../pages/Account/History.jsx";
import Download from "../pages/Account/Download.jsx";
import Playlist from "../pages/Account/Playlist.jsx";
import Watchlater from "../pages/Account/Watchlater.jsx";
import YourVideos from "../pages/Account/YourVideos.jsx";
import Create from "../pages/You/Create.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { Navigate } from "react-router-dom";
import EditVodeo from "../pages/Account/EditVideos.jsx";

// Import other pages
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<SignInAndUp />} />
            <Route path="/video/:videoID" element={<VideoPlayer />} />

            {/* Protected Routes - Wrap individual routes */}
            <Route
                path="/tweet"
                element={
                    <ProtectedRoute>
                        <Tweet />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/subscription"
                element={
                    <ProtectedRoute>
                        <Subscription />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/downloads"
                element={
                    <ProtectedRoute>
                        <Download />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/playlist"
                element={
                    <ProtectedRoute>
                        <Playlist />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/playlist/:playlistID"
                element={
                    <ProtectedRoute>
                        <Playlist />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/watchlater"
                element={
                    <ProtectedRoute>
                        <Watchlater />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/uservideos"
                element={
                    <ProtectedRoute>
                        <YourVideos />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/edit-video/:videoID"
                element={
                    <ProtectedRoute>
                        <EditVodeo />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create"
                element={
                    <ProtectedRoute>
                        <Create />
                    </ProtectedRoute>
                }
            />

            {/* 404 Handling */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;