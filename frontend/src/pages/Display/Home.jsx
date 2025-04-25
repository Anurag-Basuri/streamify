import React, {
    useEffect,
    useState,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../services/AuthContext.jsx";
import { FiMoreVertical } from "react-icons/fi";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import useWatchLater from "../../hooks/useWatchLater.js";
import { VideoCard } from "../../components/Video/VideoCard.jsx";
import { VideoCardSkeleton } from "../../components/Video/VideoCardSkeleton.jsx";
import { PlaylistModal } from "../../components/Playlist/PlaylistModal.jsx";
import { HeroSection } from "../../components/Home/HeroSection.jsx";
import { HistorySection } from "../../components/Home/HistorySection.jsx";
import { VideoGridSection } from "../../components/Home/VideoGridSection.jsx";
import { VideoInfo } from "../../components/Video/VideoInfo.jsx";
import { CreatorInfo } from "../../components/Video/CreatorInfo.jsx";
import { WatchLaterButton } from "../../components/Video/WatchLaterButton.jsx";

// Import styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const Home = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [videos, setVideos] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const watchLater = useWatchLater(user);
    const controller = useRef(new AbortController());

    // Infinite scroll state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerTarget = useRef(null);

    // API configuration based on authentication state
    const apiConfig = useMemo(
        () => ({
            headers: isAuthenticated
                ? {
                      Authorization: `Bearer ${localStorage.getItem(
                          "accessToken"
                      )}`,
                  }
                : {},
            signal: controller.current.signal,
        }),
        [isAuthenticated]
    );

    // Fetch videos with pagination - available for all users
    const fetchVideos = useCallback(
        async (pageNum) => {
            try {
                setLoadingMore(pageNum > 1);
                const { data } = await axios.get(`/api/v1/videos`, {
                    ...apiConfig, // Use API config without requiring auth
                    params: {
                        page: pageNum,
                        limit: 12,
                        sort: "-createdAt",
                    },
                });

                // Format videos and handle likes for authenticated users only
                const formattedVideos = data.data.videos.map((video) => ({
                    ...video,
                    isLiked: isAuthenticated
                        ? video.likes?.includes(user?._id)
                        : false,
                }));

                if (pageNum === 1) {
                    setVideos(formattedVideos);
                } else {
                    setVideos((prev) => [...prev, ...formattedVideos]);
                }

                setHasMore(
                    data.data.videos.length > 0 && data.data.hasNextPage
                );
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(
                        error.response?.data?.message || "Failed to load videos"
                    );
                }
            } finally {
                setIsLoading(false);
                setLoadingMore(false);
            }
        },
        [apiConfig, isAuthenticated, user?._id]
    );

    // Separate function to fetch videos immediately on component mount
    useEffect(() => {
        // Immediately fetch videos on initial render
        fetchVideos(1);
    }, []);

    // Fetch initial user data separately
    const fetchUserData = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const [historyRes, playlistsRes] = await Promise.all([
                axios.get("/api/v1/users/history", apiConfig),
                axios.get("/api/v1/playlists", apiConfig),
            ]);

            setHistory(historyRes.data.data.history);
            setPlaylists(playlistsRes.data.data.playlists);

            // Also fetch watch later data
            watchLater.fetchWatchLater();
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching user data:", error);
                toast.error(
                    error.response?.data?.message || "Failed to load user data"
                );
            }
        }
    }, [apiConfig, isAuthenticated, watchLater]);

    // Fetch user-specific data when authentication state changes
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData, isAuthenticated]);

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !loadingMore &&
                    !isLoading
                ) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadingMore, isLoading]);

    // Fetch more videos when page changes
    useEffect(() => {
        if (page > 1) {
            fetchVideos(page);
        }
    }, [page, fetchVideos]);

    // Clean up on unmount
    useEffect(() => {
        return () => controller.current.abort();
    }, []);

    // Handle video actions with authentication checks
    const handleVideoAction = useCallback(
        async (action, videoId) => {
            // Allow download without authentication
            if (action === "download") {
                try {
                    const { data } = await axios.get(
                        `/api/v1/videos/download/${videoId}`
                    );
                    window.open(data.url, "_blank");
                } catch (error) {
                    toast.error(
                        error.response?.data?.message || "Download failed"
                    );
                }
                return;
            }

            // All other actions require authentication
            if (!isAuthenticated) {
                toast.error("Please login to perform this action");
                return;
            }

            try {
                const video = videos.find((v) => v._id === videoId);
                if (!video) return;

                switch (action) {
                    case "like": {
                        const updatedVideos = videos.map((v) =>
                            v._id === videoId
                                ? {
                                      ...v,
                                      isLiked: !v.isLiked,
                                      likes: v.isLiked
                                          ? v.likes - 1
                                          : v.likes + 1,
                                  }
                                : v
                        );
                        setVideos(updatedVideos);
                        await axios.post(
                            `/api/v1/likes/video/${videoId}`,
                            {},
                            apiConfig
                        );
                        break;
                    }
                    case "watchlater": {
                        if (watchLater.isInWatchLater(videoId)) {
                            await watchLater.removeFromWatchLater(videoId);
                        } else {
                            await watchLater.addToWatchLater(videoId);
                        }
                        break;
                    }
                    case "playlist": {
                        setSelectedVideo(video);
                        setShowPlaylistModal(true);
                        break;
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Action failed");
            }
        },
        [videos, apiConfig, watchLater, isAuthenticated]
    );

    // Handle playlist operations
    const handlePlaylistOperations = useCallback(
        async (operation, playlistId) => {
            // Playlist operations always require authentication
            if (!isAuthenticated) {
                toast.error("Please login to manage playlists");
                return;
            }

            try {
                switch (operation) {
                    case "add": {
                        if (!selectedVideo) return;
                        await axios.post(
                            `/api/v1/playlists/${playlistId}/videos/${selectedVideo._id}`,
                            {},
                            apiConfig
                        );
                        toast.success("Added to playlist!");
                        break;
                    }
                    case "delete": {
                        await axios.delete(
                            `/api/v1/playlists/${playlistId}`,
                            apiConfig
                        );
                        setPlaylists((prev) =>
                            prev.filter((p) => p._id !== playlistId)
                        );
                        toast.success("Playlist deleted!");
                        break;
                    }
                    case "create": {
                        const { data } = await axios.post(
                            "/api/v1/playlists/create",
                            { name: newPlaylistName },
                            apiConfig
                        );
                        setPlaylists((prev) => [data.data, ...prev]);
                        setNewPlaylistName("");
                        toast.success("Playlist created!");
                        break;
                    }
                }
                setShowPlaylistModal(false);
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Operation failed"
                );
            }
        },
        [selectedVideo, newPlaylistName, apiConfig, isAuthenticated]
    );

    const videoGridContent = useMemo(
        () =>
            isLoading ? (
                [...Array(8)].map((_, i) => <VideoCardSkeleton key={i} />)
            ) : videos.length > 0 ? (
                videos.map((video) => (
                    <VideoCard
                        key={video._id}
                        video={video}
                        onAction={handleVideoAction}
                        inWatchLater={
                            isAuthenticated &&
                            watchLater.isInWatchLater(video._id)
                        }
                        watchLaterLoading={watchLater.loading}
                        isAuthenticated={isAuthenticated}
                    />
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">No videos available</p>
                </div>
            ),
        [isLoading, videos, handleVideoAction, watchLater, isAuthenticated]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <HeroSection />

                {/* History Section - Only for authenticated users */}
                {isAuthenticated && history.length > 0 && (
                    <HistorySection
                        history={history}
                        watchLater={watchLater}
                        onAction={handleVideoAction}
                        inWatchLater={watchLater.isInWatchLater}
                        watchLaterLoading={watchLater.loading}
                    />
                )}

                {/* Video Grid - For all users */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>
                    <VideoGridSection
                        videoGridContent={videoGridContent}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                    />
                </div>

                {/* Observer element for infinite scroll */}
                {hasMore && (
                    <div
                        ref={observerTarget}
                        className="h-20 flex items-center justify-center"
                    >
                        {loadingMore && (
                            <div className="loader-container">
                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Playlist Modal - Only shown for authenticated users */}
                <AnimatePresence>
                    {showPlaylistModal && isAuthenticated && (
                        <PlaylistModal
                            isOpen={showPlaylistModal}
                            onClose={() => setShowPlaylistModal(false)}
                            playlists={playlists}
                            newPlaylistName={newPlaylistName}
                            setNewPlaylistName={setNewPlaylistName}
                            onPlaylistAction={handlePlaylistOperations}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;