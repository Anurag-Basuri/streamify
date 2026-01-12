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

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

// Public Pages
const Home = lazy(() => import("../pages/Display/Home.jsx"));
const SearchResults = lazy(() => import("../pages/Display/SearchResults.jsx"));
const Tweet = lazy(() => import("../pages/Display/Tweet.jsx"));
const Subscription = lazy(() => import("../pages/Display/Subscription.jsx"));
const VideoPlayer = lazy(() => import("../components/Video/VideoPlayer.jsx"));

// Auth Pages
const SignInAndUp = lazy(() => import("../pages/You/SignInAndUp.jsx"));
const ForgotPassword = lazy(() => import("../pages/You/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/You/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("../pages/You/VerifyEmail.jsx"));

// Protected Account Pages
const Dashboard = lazy(() => import("../pages/Account/Dashboard.jsx"));
const Settings = lazy(() => import("../pages/Account/Settings.jsx"));
const Profile = lazy(() => import("../pages/You/Profile.jsx"));
const History = lazy(() => import("../pages/Account/History.jsx"));
const Download = lazy(() => import("../pages/Account/Download.jsx"));
const Playlist = lazy(() => import("../pages/Account/Playlist.jsx"));
const Watchlater = lazy(() => import("../pages/Account/Watchlater.jsx"));
const YourVideos = lazy(() => import("../pages/Account/YourVideos.jsx"));
const LikedVideos = lazy(() => import("../pages/Account/LikedVideos.jsx"));
const Notifications = lazy(() => import("../pages/Account/Notifications.jsx"));
const Create = lazy(() => import("../pages/You/Create.jsx"));
const EditVideo = lazy(() => import("../pages/Account/EditVideos.jsx"));
const PlaylistDetail = lazy(() =>
    import("../components/Playlist/PlaylistDetail.jsx")
);

// ============================================================================
// ROUTE WRAPPERS
// ============================================================================

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

// ============================================================================
// ROUTES CONFIGURATION
// ============================================================================

const AppRoutes = () => {
    return (
        <Routes>
            {/* ============ PUBLIC ROUTES ============ */}
            <Route path="/" element={withSuspense(Home)} />
            <Route path="/search" element={withSuspense(SearchResults)} />
            <Route path="/video/:videoID" element={withSuspense(VideoPlayer)} />

            {/* Auth Routes */}
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

            {/* ============ PROTECTED ROUTES ============ */}

            {/* Dashboard & Profile */}
            <Route path="/dashboard" element={withProtection(Dashboard)} />
            <Route path="/profile" element={withProtection(Profile)} />
            <Route path="/settings" element={withProtection(Settings)} />
            <Route
                path="/notifications"
                element={withProtection(Notifications)}
            />

            {/* Content Management */}
            <Route path="/create" element={withProtection(Create)} />
            <Route path="/uservideos" element={withProtection(YourVideos)} />
            <Route
                path="/edit-video/:videoID"
                element={withProtection(EditVideo)}
            />

            {/* Library */}
            <Route path="/history" element={withProtection(History)} />
            <Route path="/liked" element={withProtection(LikedVideos)} />
            <Route path="/watchlater" element={withProtection(Watchlater)} />
            <Route path="/playlist" element={withProtection(Playlist)} />
            <Route
                path="/playlist/:playlistID"
                element={withProtection(PlaylistDetail)}
            />
            <Route path="/downloads" element={withProtection(Download)} />

            {/* Social */}
            <Route path="/community" element={<Tweet />} />
            <Route
                path="/subscriptions"
                element={withProtection(Subscription)}
            />

            {/* Legacy redirects */}
            <Route
                path="/tweet"
                element={<Navigate to="/community" replace />}
            />
            <Route
                path="/subscription"
                element={<Navigate to="/subscriptions" replace />}
            />

            {/* ============ FALLBACK ============ */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
