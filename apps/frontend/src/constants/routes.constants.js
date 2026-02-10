/**
 * Route Constants
 * Centralized route path definitions for navigation
 */

// ============================================================================
// PUBLIC ROUTES (No auth required)
// ============================================================================

export const PUBLIC_ROUTES = {
    HOME: "/",
    AUTH: "/auth",
    LOGIN: "/auth?mode=login",
    SIGNUP: "/auth?mode=signup",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password/:token",
    VERIFY_EMAIL: "/verify-email/:token",
    VIDEO: "/video/:id",
    CHANNEL: "/channel/:username",
    SEARCH: "/search",
};

// ============================================================================
// PROTECTED ROUTES (Auth required)
// ============================================================================

export const PROTECTED_ROUTES = {
    // User routes
    PROFILE: "/profile",
    SETTINGS: "/settings",

    // Video management
    UPLOAD: "/upload",
    EDIT_VIDEO: "/edit-video/:id",
    MY_VIDEOS: "/my-videos",

    // Collections
    PLAYLISTS: "/playlists",
    PLAYLIST: "/playlist/:id",
    WATCH_LATER: "/watch-later",
    HISTORY: "/history",
    LIKED_VIDEOS: "/liked-videos",

    // Social
    SUBSCRIPTIONS: "/subscriptions",
    TWEETS: "/tweets",

    // Dashboard
    DASHBOARD: "/dashboard",
};

// ============================================================================
// ROUTE HELPERS
// ============================================================================

export const ROUTES = {
    ...PUBLIC_ROUTES,
    ...PROTECTED_ROUTES,

    // Dynamic route helpers
    video: (id) => `/video/${id}`,
    channel: (username) => `/channel/${username}`,
    playlist: (id) => `/playlist/${id}`,
    editVideo: (id) => `/edit-video/${id}`,
    resetPassword: (token) => `/reset-password/${token}`,
    verifyEmail: (token) => `/verify-email/${token}`,
    search: (query) => `/search?q=${encodeURIComponent(query)}`,
};

// ============================================================================
// ROUTE METADATA
// ============================================================================

export const ROUTE_META = {
    [PUBLIC_ROUTES.HOME]: {
        title: "Home",
        requiresAuth: false,
    },
    [PUBLIC_ROUTES.AUTH]: {
        title: "Sign In",
        requiresAuth: false,
        hideForAuth: true,
    },
    [PROTECTED_ROUTES.UPLOAD]: {
        title: "Upload Video",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.PROFILE]: {
        title: "Profile",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.SETTINGS]: {
        title: "Settings",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.PLAYLISTS]: {
        title: "Playlists",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.WATCH_LATER]: {
        title: "Watch Later",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.HISTORY]: {
        title: "Watch History",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.SUBSCRIPTIONS]: {
        title: "Subscriptions",
        requiresAuth: true,
    },
    [PROTECTED_ROUTES.DASHBOARD]: {
        title: "Dashboard",
        requiresAuth: true,
    },
};

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

export const NAV_ITEMS = {
    main: [
        { path: PUBLIC_ROUTES.HOME, label: "Home", icon: "Home" },
        {
            path: PROTECTED_ROUTES.SUBSCRIPTIONS,
            label: "Subscriptions",
            icon: "Users",
            requiresAuth: true,
        },
    ],
    library: [
        {
            path: PROTECTED_ROUTES.HISTORY,
            label: "History",
            icon: "Clock",
            requiresAuth: true,
        },
        {
            path: PROTECTED_ROUTES.WATCH_LATER,
            label: "Watch Later",
            icon: "Clock",
            requiresAuth: true,
        },
        {
            path: PROTECTED_ROUTES.LIKED_VIDEOS,
            label: "Liked Videos",
            icon: "Heart",
            requiresAuth: true,
        },
        {
            path: PROTECTED_ROUTES.PLAYLISTS,
            label: "Playlists",
            icon: "List",
            requiresAuth: true,
        },
    ],
    creator: [
        {
            path: PROTECTED_ROUTES.UPLOAD,
            label: "Upload",
            icon: "Upload",
            requiresAuth: true,
        },
        {
            path: PROTECTED_ROUTES.MY_VIDEOS,
            label: "My Videos",
            icon: "Video",
            requiresAuth: true,
        },
        {
            path: PROTECTED_ROUTES.DASHBOARD,
            label: "Dashboard",
            icon: "BarChart",
            requiresAuth: true,
        },
    ],
};

export default ROUTES;
