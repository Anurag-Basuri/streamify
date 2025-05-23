import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaArrowLeft,
    FaSpinner,
    FaSearch,
    FaPlus,
    FaTrash,
    FaPlay,
    FaTimes,
    FaExclamationTriangle,
    FaWifi,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import usePlaylist from "../../hooks/usePlaylist";

const PlaylistDetail = () => {
    const { playlistID } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();

    // Use the custom playlist hook
    const {
        playlist,
        loading,
        error,
        fetchPlaylist,
        addVideo,
        removeVideo,
        clearError,
    } = usePlaylist(playlistID, user);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Error boundary state
    const [hasError, setHasError] = useState(false);

    // Handle component-level errors
    const handleComponentError = useCallback((error, operation) => {
        console.error(`${operation} error:`, error);
        setHasError(true);

        let errorMessage;
        if (error.response?.status === 404) {
            errorMessage = "Playlist not found";
        } else if (error.response?.status === 403) {
            errorMessage = "You don't have access to this playlist";
        } else if (error.request) {
            errorMessage = "Network error. Please check your connection.";
        } else {
            errorMessage = error.message || `Failed to ${operation}`;
        }

        toast.error(errorMessage);
    }, []);

    // Retry mechanism for failed operations
    const retryOperation = useCallback(async () => {
        try {
            setHasError(false);
            clearError();
            setRetryCount((prev) => prev + 1);

            if (user) {
                await fetchPlaylist(playlistID);
            }
        } catch (err) {
            handleComponentError(err, "retry loading playlist");
        }
    }, [user, fetchPlaylist, playlistID, clearError, handleComponentError]);

    // Search effect with cleanup
    useEffect(() => {
        const searchVideos = debounce(async (query) => {
            if (!query.trim()) {
                setSearchResults([]);
                setShowSearchResults(false);
                setSearchError(null);
                return;
            }
    
            if (!user?.token && !localStorage.getItem("accessToken")) {
                setSearchError("Authentication required for search");
                toast.error("Please log in to search videos");
                return;
            }
    
            try {
                setIsSearching(true);
                setSearchError(null);
                setShowSearchResults(true);
    
                const token =
                    user?.token || localStorage.getItem("accessToken");
                const { data } = await axios.get(`/api/v1/videos/search`, {
                    params: { query: query.trim() },
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000, // 10 second timeout
                });
    
                setSearchResults(data.data || []);
            } catch (err) {
                console.error("Search error:", err);
    
                let errorMessage;
                if (err.code === "ECONNABORTED") {
                    errorMessage = "Search timeout. Please try again.";
                } else if (err.response?.status === 401) {
                    errorMessage = "Session expired. Please log in again.";
                    localStorage.removeItem("accessToken");
                } else if (err.response?.status === 429) {
                    errorMessage =
                        "Too many search requests. Please wait a moment.";
                } else if (err.request) {
                    errorMessage =
                        "Network error. Please check your connection.";
                } else {
                    errorMessage = "Search failed. Please try again.";
                }
    
                setSearchError(errorMessage);
                setSearchResults([]);
                toast.error(errorMessage);
            } finally {
                setIsSearching(false);
            }
    
            if (!user?.token && !localStorage.getItem("accessToken")) {
                setSearchError("Authentication required for search");
                toast.error("Please log in to search videos");
                return;
            }
    
            try {
                setIsSearching(true);
                setSearchError(null);
                setShowSearchResults(true);
    
                const token =
                    user?.token || localStorage.getItem("accessToken");
                const { data } = await axios.get(`/api/v1/videos/search`, {
                    params: { query: query.trim() },
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000, // 10 second timeout
                });
    
                setSearchResults(data.data || []);
            } catch (err) {
                console.error("Search error:", err);
    
                let errorMessage;
                if (err.code === "ECONNABORTED") {
                    errorMessage = "Search timeout. Please try again.";
                } else if (err.response?.status === 401) {
                    errorMessage = "Session expired. Please log in again.";
                    localStorage.removeItem("accessToken");
                } else if (err.response?.status === 429) {
                    errorMessage =
                        "Too many search requests. Please wait a moment.";
                } else if (err.request) {
                    errorMessage =
                        "Network error. Please check your connection.";
                } else {
                    errorMessage = "Search failed. Please try again.";
                }
    
                setSearchError(errorMessage);
                setSearchResults([]);
                toast.error(errorMessage);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        if (searchQuery) {
            searchVideos(searchQuery);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
            setSearchError(null);
        }

        return () => {
            searchVideos.cancel();
        };
    }, [searchQuery, user, setSearchResults, setShowSearchResults, setSearchError, setIsSearching]);

    // Enhanced add video handler
    const handleAddVideo = async (videoId) => {
        if (!videoId) {
            toast.error("Invalid video selection");
            return;
        }

        try {
            const success = await addVideo(videoId);
            if (success) {
                setSearchQuery("");
                setShowSearchResults(false);
                setSearchError(null);
                // Refresh playlist to ensure consistency
                setTimeout(() => fetchPlaylist(playlistID), 500);
            }
        } catch (err) {
            handleComponentError(err, "add video");
        }
    };

    // Enhanced remove video handler
    const handleRemoveVideo = async (videoId) => {
        if (!videoId) {
            toast.error("Invalid video selection");
            return;
        }

        try {
            const success = await removeVideo(videoId);
            if (success) {
                // Refresh playlist to ensure consistency
                setTimeout(() => fetchPlaylist(playlistID), 500);
            }
        } catch (err) {
            handleComponentError(err, "remove video");
        }
    };

    // Initial data fetch with error handling
    useEffect(() => {
        if (!playlistID) {
            navigate("/playlists");
            return;
        }

        if (user) {
            fetchPlaylist(playlistID).catch((err) => {
                handleComponentError(err, "load playlist");
            });
        }
    }, [playlistID, user, fetchPlaylist, navigate, handleComponentError]);

    // Check if user is playlist owner
    const isOwner = user?._id === playlist?.owner?._id;

    // Theme-aware styles
    const getThemeStyles = () => ({
        container: `min-h-screen ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        } text-${theme === "dark" ? "white" : "gray-900"} p-4 sm:p-8`,
        card: `bg-${
            theme === "dark" ? "gray-800" : "white"
        } rounded-xl p-6 relative overflow-hidden`,
        input: `w-full bg-${
            theme === "dark" ? "gray-700" : "gray-100"
        } rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none`,
        searchResults: `bg-${
            theme === "dark" ? "gray-700" : "gray-100"
        } rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto`,
        searchItem: `bg-${
            theme === "dark" ? "gray-600" : "gray-200"
        } hover:bg-${
            theme === "dark" ? "gray-500" : "gray-300"
        } rounded-lg p-4`,
    });

    const styles = getThemeStyles();

    // Error boundary UI
    if (hasError) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800 rounded-xl p-8 text-center max-w-md w-full"
                >
                    <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {error ||
                            "An unexpected error occurred while loading the playlist."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={retryOperation}
                            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaWifi />
                            Retry
                        </button>
                        <button
                            onClick={() => navigate("/playlists")}
                            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaArrowLeft />
                            Back to Playlists
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <FaSpinner className="animate-spin text-4xl text-purple-400" />
                    <p className="text-gray-400">Loading playlist...</p>
                    <p className="text-sm text-gray-500">
                        Attempt {retryCount + 1}
                    </p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error && !playlist) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-xl p-8 text-center max-w-md w-full"
                >
                    <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">
                        Unable to Load Playlist
                    </h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={retryOperation}
                            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaWifi />
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate("/playlists")}
                            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaArrowLeft />
                            Back to Playlists
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
        >
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <FaArrowLeft />
                    Back to Playlists
                </button>

                {playlist && (
                    <div className="space-y-8">
                        {/* Playlist Header */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={styles.card}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                            <h1 className="text-3xl font-bold mb-4 relative">
                                {playlist.name}
                            </h1>
                            <p className="text-gray-400 mb-6 relative">
                                {playlist.description ||
                                    "No description available"}
                            </p>

                            <div className="flex items-center gap-3 text-gray-400 relative">
                                <span>Created by:</span>
                                <span className="text-purple-400">
                                    {playlist.owner?.userName || "Unknown User"}
                                </span>
                            </div>
                        </motion.div>

                        {/* Video Search (only for owner) */}
                        {isOwner && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className={styles.card}
                            >
                                <h2 className="text-2xl font-semibold mb-4">
                                    Add Videos
                                </h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search videos by title, description, or tags..."
                                        className={styles.input}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        maxLength={100}
                                    />
                                    <FaSearch className="absolute left-4 top-4 text-gray-400" />
                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setShowSearchResults(false);
                                                setSearchError(null);
                                            }}
                                            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>

                                {/* Search Results */}
                                <AnimatePresence>
                                    {showSearchResults && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`${styles.searchResults} mt-4`}
                                        >
                                            {searchError ? (
                                                <div className="text-center py-4">
                                                    <FaExclamationTriangle className="text-2xl text-red-400 mx-auto mb-2" />
                                                    <p className="text-red-400">
                                                        {searchError}
                                                    </p>
                                                    <button
                                                        onClick={() =>
                                                            searchVideos(
                                                                searchQuery
                                                            )
                                                        }
                                                        className="mt-2 text-purple-400 hover:text-purple-300 underline"
                                                    >
                                                        Try Again
                                                    </button>
                                                </div>
                                            ) : isSearching ? (
                                                <div className="flex justify-center py-4">
                                                    <FaSpinner className="animate-spin text-purple-400" />
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((video) => (
                                                    <motion.div
                                                        key={video._id}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        className={`${styles.searchItem} flex items-center justify-between`}
                                                    >
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <img
                                                                src={
                                                                    video.thumbnail ||
                                                                    "/fallback-thumbnail.jpg"
                                                                }
                                                                alt={
                                                                    video.title
                                                                }
                                                                className="w-16 h-12 object-cover rounded"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.target.src =
                                                                        "/fallback-thumbnail.jpg";
                                                                    e.target.onerror =
                                                                        null;
                                                                }}
                                                            />
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="font-medium truncate">
                                                                    {
                                                                        video.title
                                                                    }
                                                                </span>
                                                                <span className="text-sm text-gray-400 line-clamp-1">
                                                                    {video.description ||
                                                                        "No description"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleAddVideo(
                                                                    video._id
                                                                )
                                                            }
                                                            disabled={
                                                                playlist.videos?.some(
                                                                    (v) =>
                                                                        (typeof v ===
                                                                        "string"
                                                                            ? v
                                                                            : v._id) ===
                                                                        video._id
                                                                ) || loading
                                                            }
                                                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4 flex-shrink-0"
                                                        >
                                                            {loading ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaPlus />
                                                            )}
                                                            {playlist.videos?.some(
                                                                (v) =>
                                                                    (typeof v ===
                                                                    "string"
                                                                        ? v
                                                                        : v._id) ===
                                                                    video._id
                                                            )
                                                                ? "Added"
                                                                : "Add"}
                                                        </button>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-gray-400 text-center py-4">
                                                    <FaSearch className="text-2xl mx-auto mb-2" />
                                                    <p>
                                                        No videos found for "
                                                        {searchQuery}"
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        Try different keywords
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* Playlist Videos */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">
                                    Videos ({playlist.videos?.length || 0})
                                </h2>
                                {error && (
                                    <button
                                        onClick={() => {
                                            clearError();
                                            fetchPlaylist(playlistID);
                                        }}
                                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                                    >
                                        Refresh
                                    </button>
                                )}
                            </div>

                            {playlist.videos?.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <AnimatePresence>
                                        {playlist.videos.map((video, index) => {
                                            // Handle both populated and non-populated videos
                                            const videoData =
                                                typeof video === "string"
                                                    ? { _id: video }
                                                    : video;

                                            if (!videoData?._id) return null;

                                            return (
                                                <motion.div
                                                    key={videoData._id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    transition={{
                                                        delay: index * 0.1,
                                                    }}
                                                    className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors group relative"
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={
                                                                videoData.thumbnail ||
                                                                "/fallback-thumbnail.jpg"
                                                            }
                                                            alt={
                                                                videoData.title ||
                                                                "Video thumbnail"
                                                            }
                                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "/fallback-thumbnail.jpg";
                                                                e.target.onerror =
                                                                    null;
                                                            }}
                                                        />
                                                        {videoData.title && (
                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/video/${videoData._id}`
                                                                    )
                                                                }
                                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                            >
                                                                <FaPlay className="text-4xl text-white" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-semibold mb-2 truncate">
                                                        {videoData.title ||
                                                            "Untitled Video"}
                                                    </h3>
                                                    <p className="text-gray-400 line-clamp-3 min-h-[4.5rem]">
                                                        {videoData.description ||
                                                            "No description available"}
                                                    </p>
                                                    {isOwner && (
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveVideo(
                                                                    videoData._id
                                                                )
                                                            }
                                                            disabled={loading}
                                                            className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                        >
                                                            {loading ? (
                                                                <FaSpinner className="animate-spin text-white" />
                                                            ) : (
                                                                <FaTrash className="text-white" />
                                                            )}
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-gray-800 rounded-xl p-8 text-center"
                                >
                                    <div className="w-20 h-20 mx-auto mb-4 relative">
                                        <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-pulse" />
                                        <div
                                            className="absolute inset-2 bg-purple-500/30 rounded-full animate-pulse"
                                            style={{ animationDelay: "0.2s" }}
                                        />
                                        <div
                                            className="absolute inset-4 bg-purple-500/40 rounded-full animate-pulse"
                                            style={{ animationDelay: "0.4s" }}
                                        />
                                        <FaPlay className="absolute inset-0 m-auto text-4xl text-purple-400" />
                                    </div>
                                    <p className="text-gray-400 text-xl mb-2">
                                        No videos in this playlist yet
                                    </p>
                                    {isOwner ? (
                                        <p className="text-gray-500">
                                            Use the search above to add videos
                                        </p>
                                    ) : (
                                        <p className="text-gray-500">
                                            The playlist owner hasn't added any
                                            videos yet
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PlaylistDetail;
