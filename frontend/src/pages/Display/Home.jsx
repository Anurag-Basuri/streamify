import {
    useState,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import useWatchLater from "../../hooks/useWatchLater.js";
import useVideos from "../../hooks/useVideos.js";
import useUserData from "../../hooks/useUserData.js";
import useAuth from "../../hooks/useAuth.js";
import VideoCard from "../../components/Video/VideoCard.jsx";
import { VideoCardSkeleton } from "../../components/Video/VideoCardSkeleton.jsx";
import { PlaylistModal } from "../../components/Playlist/PlaylistModal.jsx";
import { HeroSection } from "../../components/Home/HeroSection.jsx";
import { HistorySection } from "../../components/Home/HistorySection.jsx";
import { VideoGridSection } from "../../components/Home/VideoGridSection.jsx";

// Import styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const Home = () => {
    const { user, isAuthenticated, token } = useAuth();
    const apiConfig = useMemo(
        () => ({
            headers: { Authorization: `Bearer ${token}` },
        }),
        [token]
    );
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const watchLater = useWatchLater(user);
    const observerTarget = useRef(null);

    // Custom hooks
    const { videos, setVideos, isLoading, hasMore, loadingMore } = useVideos(
        isAuthenticated,
        user
    );

    const { history, playlists, setPlaylists } = useUserData(
        isAuthenticated,
        apiConfig,
        watchLater
    );

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
        [videos, apiConfig, watchLater, isAuthenticated, setVideos]
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

                {isAuthenticated && history.length > 0 && (
                    <HistorySection
                        history={history}
                        watchLater={watchLater}
                        onAction={handleVideoAction}
                        inWatchLater={watchLater.isInWatchLater}
                        watchLaterLoading={watchLater.loading}
                    />
                )}

                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>
                    <VideoGridSection
                        videoGridContent={videoGridContent}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                    />
                </div>

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
