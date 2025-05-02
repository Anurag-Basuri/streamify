import { useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import useWatchLater from "../../hooks/useWatchLater.js";
import useVideos from "../../hooks/useVideos.js";
import useUserData from "../../hooks/useUserData.js";
import useAuth from "../../hooks/useAuth.js";
import VideoCard from "../../components/Video/VideoCard.jsx";
import { VideoCardSkeleton } from "../../components/Video/VideoCardSkeleton.jsx";
import { HeroSection } from "../../components/Home/HeroSection.jsx";
import { VideoGridSection } from "../../components/Home/VideoGridSection.jsx";

// Import styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

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

    // State for playlist modal
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const watchLater = useWatchLater(user);
    const observerTarget = useRef(null);

    // Custom hooks
    const { videos, setVideos, isLoading, hasMore, loadingMore } = useVideos(
        isAuthenticated,
        user
    );
    const { playlists, setPlaylists } = useUserData(isAuthenticated, apiConfig);

    // Handle video actions with authentication checks
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

                // Add to history when video is viewed
                if (action === "view") {
                    await axios.post(
                        `/api/v1/history/${videoId}`,
                        {},
                        apiConfig
                    );
                }

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
        [videos, apiConfig, watchLater, isAuthenticated, setVideos]
    );

    // Handle playlist operations
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
                        // Add video to newly created playlist
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
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">No videos available</p>
                </div>
            ),
        [isLoading, videos, handleVideoAction, watchLater, isAuthenticated]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <HeroSection />

                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>
                    <VideoGridSection
                        videoGridContent={videoGridContent}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                    />
                </div>

                {/* Playlist Modal */}
                <AnimatePresence>
                    {showPlaylistModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                            onClick={() => setShowPlaylistModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold mb-4">
                                    Add to Playlist
                                </h3>

                                {/* Create New Playlist */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={newPlaylistName}
                                        onChange={(e) =>
                                            setNewPlaylistName(e.target.value)
                                        }
                                        placeholder="New playlist name"
                                        className="w-full p-2 rounded bg-gray-700"
                                    />
                                    <button
                                        onClick={() =>
                                            handlePlaylistOperations("create")
                                        }
                                        className="mt-2 w-full bg-purple-600 hover:bg-purple-700 p-2 rounded"
                                    >
                                        Create & Add
                                    </button>
                                </div>

                                {/* Existing Playlists */}
                                <div className="space-y-2">
                                    <h4 className="font-medium mb-2">
                                        Existing Playlists
                                    </h4>
                                    {playlists.map((playlist) => (
                                        <button
                                            key={playlist._id}
                                            onClick={() =>
                                                handlePlaylistOperations(
                                                    "add",
                                                    playlist._id
                                                )
                                            }
                                            className="w-full text-left p-2 hover:bg-gray-700 rounded"
                                        >
                                            {playlist.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasMore && (
                    <div
                        ref={observerTarget}
                        className="h-20 flex items-center justify-center"
                    >
                        {loadingMore && (
                            <div className="loader-container">
                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
