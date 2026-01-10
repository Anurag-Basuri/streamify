/**
 * Application Routes with Lazy Loading
 * Performance optimized with React.lazy and Suspense
 */
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-indigo-500 rounded-full animate-spin animation-delay-150" />
        </div>
    </div>
);

// Lazy load pages for better initial bundle size
const Home = lazy(() => import("../pages/Display/Home.jsx"));
const Profile = lazy(() => import("../pages/You/Profile.jsx"));
const SignInAndUp = lazy(() => import("../pages/You/SignInAndUp.jsx"));
const ForgotPassword = lazy(() => import("../pages/You/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/You/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("../pages/You/VerifyEmail.jsx"));
const Tweet = lazy(() => import("../pages/Display/Tweet.jsx"));
const Subscription = lazy(() => import("../pages/Display/Subscription.jsx"));
const History = lazy(() => import("../pages/Account/History.jsx"));
const Download = lazy(() => import("../pages/Account/Download.jsx"));
const Playlist = lazy(() => import("../pages/Account/Playlist.jsx"));
const Watchlater = lazy(() => import("../pages/Account/Watchlater.jsx"));
const YourVideos = lazy(() => import("../pages/Account/YourVideos.jsx"));
const Create = lazy(() => import("../pages/You/Create.jsx"));
const VideoPlayer = lazy(() => import("../components/Video/VideoPlayer.jsx"));
const EditVideo = lazy(() => import("../pages/Account/EditVideos.jsx"));
const PlaylistDetail = lazy(() =>
    import("../components/Playlist/PlaylistDetail.jsx")
);

/**
 * Wraps a component with Suspense for lazy loading
 */
const withSuspense = (Component) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

/**
 * Wraps a component with both ProtectedRoute and Suspense
 */
const withProtection = (Component) => (
    <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
            <Component />
        </Suspense>
    </ProtectedRoute>
);

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={withSuspense(Home)} />
            <Route path="/auth" element={withSuspense(SignInAndUp)} />
            <Route
                path="/forgot-password"
                element={withSuspense(ForgotPassword)}
            />
            <Route
                path="/reset-password/:token"
                element={withSuspense(ResetPassword)}
            />
            <Route
                path="/verify-email/:token"
                element={withSuspense(VerifyEmail)}
            />
            <Route path="/video/:videoID" element={withSuspense(VideoPlayer)} />

            {/* Protected Routes */}
            <Route path="/tweet" element={withProtection(Tweet)} />
            <Route
                path="/subscription"
                element={withProtection(Subscription)}
            />
            <Route path="/history" element={withProtection(History)} />
            <Route path="/profile" element={withProtection(Profile)} />
            <Route path="/downloads" element={withProtection(Download)} />
            <Route path="/playlist" element={withProtection(Playlist)} />
            <Route
                path="/playlist/:playlistID"
                element={withProtection(PlaylistDetail)}
            />
            <Route path="/watchlater" element={withProtection(Watchlater)} />
            <Route path="/uservideos" element={withProtection(YourVideos)} />
            <Route
                path="/edit-video/:videoID"
                element={withProtection(EditVideo)}
            />
            <Route path="/create" element={withProtection(Create)} />

            {/* 404 Handling */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
