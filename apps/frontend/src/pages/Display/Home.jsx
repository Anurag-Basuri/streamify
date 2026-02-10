import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import useWatchLater from "../../hooks/useWatchLater.js";
import useVideos from "../../hooks/useVideos.js";
import useUserData from "../../hooks/useUserData.js";
import useAuth from "../../hooks/useAuth.js";
import { HeroSection } from "../../components/Home/HeroSection.jsx";
import { VideoCardSkeleton } from "../../components/Video/VideoCardSkeleton.jsx";
import VideoCard from "../../components/Video/VideoCard.jsx";
import { VideoGridSection } from "../../components/Home/VideoGridSection.jsx";
import { HomeFilters } from "../../components/Home/HomeFilters.jsx"; // Import Filters

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const apiConfig = useMemo(
        () => ({
            headers: {
                Authorization: isAuthenticated
                    ? `Bearer ${localStorage.getItem("accessToken")}`
                    : "",
            },
        }),
        [isAuthenticated]
    );

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const watchLater = useWatchLater(user);
    const observerTarget = useRef(null);
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState("all"); // Filter state

    // Pass filters to useVideos
    const {
        videos,
        setVideos,
        isLoading,
        hasMore,
        loadingMore,
        updateFilter, // Get updateFilter from hook
    } = useVideos(isAuthenticated, user);

    const { playlists, setPlaylists } = useUserData(
        isAuthenticated,
        apiConfig,
        watchLater
    );

    // Handle filter change
    const handleFilterChange = useCallback(
        (filterId) => {
            setActiveFilter(filterId);
            if (filterId === "all") {
                updateFilter("tags", []); // Clear tags
            } else {
                updateFilter("tags", [filterId]); // Set tag filter
            }
            // Reset page or other state if needed (useVideos handles data reset)
        },
        [updateFilter]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore]);

    const fetchNextPage = () => {
        if (!loadingMore) {
            setPage((prev) => prev + 1);
        }
    };

    const handleVideoAction = useCallback(
        async (action, videoId) => {
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

            if (!isAuthenticated) {
                toast.error("Please login to perform this action");
                return;
            }

            try {
                const video = videos.find((v) => v._id === videoId);
                if (!video) return;

                if (action === "view") {
                    await axios.post(
                        `/api/v1/history/${videoId}`,
                        {},
                        apiConfig
                    );
                }

                switch (action) {
                    case "like": {
                        const originalVideos = [...videos];
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
                        try {
                            await axios.post(
                                `/api/v1/likes/video/${videoId}`,
                                {},
                                apiConfig
                            );
                        } catch (error) {
                            setVideos(originalVideos);
                            throw error;
                        }
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
        [videos, apiConfig, watchLater, isAuthenticated, setVideos]
    );

    const handlePlaylistOperations = useCallback(
        async (operation, playlistId) => {
            if (!isAuthenticated) {
                toast.error("Please login to manage playlists");
                return;
            }

            try {
                switch (operation) {
                    case "create": {
                        const { data } = await axios.post(
                            "/api/v1/playlists/create",
                            { name: newPlaylistName },
                            apiConfig
                        );
                        setPlaylists((prev) => [data.data, ...prev]);
                        setNewPlaylistName("");
                        await handlePlaylistOperations("add", data.data._id);
                        break;
                    }
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
                }
                setShowPlaylistModal(false);
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Operation failed"
                );
            }
        },
        [
            selectedVideo,
            newPlaylistName,
            apiConfig,
            isAuthenticated,
            setPlaylists,
        ]
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
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-[var(--text-tertiary)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        No videos found
                    </h3>
                    <p className="text-[var(--text-tertiary)] max-w-sm">
                        Try adjusting your filters or search for something else.
                    </p>
                </div>
            ),
        [isLoading, videos, handleVideoAction, watchLater, isAuthenticated]
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <HeroSection />

                <div className="mt-8 space-y-6">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent px-4 md:px-0">
                            Discover
                        </h2>

                        <HomeFilters
                            activeFilter={activeFilter}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    <VideoGridSection
                        videoGridContent={videoGridContent}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                    />
                </div>

                <AnimatePresence>
                    {showPlaylistModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowPlaylistModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[var(--bg-elevated)] border border-[var(--border-light)] p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Background Effect */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[var(--brand-primary)]/20 blur-3xl rounded-full" />
                                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />

                                <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] relative z-10">
                                    Add to Playlist
                                </h3>

                                <div className="mb-6 relative z-10">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newPlaylistName}
                                            onChange={(e) =>
                                                setNewPlaylistName(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Create new playlist..."
                                            className="flex-1 p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none transition-all"
                                        />
                                        <button
                                            onClick={() =>
                                                handlePlaylistOperations(
                                                    "create"
                                                )
                                            }
                                            disabled={!newPlaylistName.trim()}
                                            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl font-medium transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                    <h4 className="text-sm font-semibold mb-3 text-[var(--text-secondary)] uppercase tracking-wider">
                                        Your Playlists
                                    </h4>
                                    {playlists.length > 0 ? (
                                        playlists.map((playlist) => (
                                            <button
                                                key={playlist._id}
                                                onClick={() =>
                                                    handlePlaylistOperations(
                                                        "add",
                                                        playlist._id
                                                    )
                                                }
                                                className="w-full text-left p-3 hover:bg-[var(--bg-secondary)] rounded-xl text-[var(--text-primary)] transition-all flex items-center justify-between group border border-transparent hover:border-[var(--border-light)]"
                                            >
                                                <span className="font-medium truncate">
                                                    {playlist.name}
                                                </span>
                                                <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-md group-hover:bg-[var(--bg-primary)] transition-colors">
                                                    {playlist.videos?.length ||
                                                        0}{" "}
                                                    videos
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-[var(--text-tertiary)]">
                                            No playlists found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasMore && (
                    <div
                        ref={observerTarget}
                        className="h-24 flex items-center justify-center mt-8"
                    >
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <div className="w-5 h-5 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-medium">
                                    Loading more videos...
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
