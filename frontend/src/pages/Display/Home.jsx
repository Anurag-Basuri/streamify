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
import {
    FaEye,
    FaClock,
    FaUser,
    FaHeart,
    FaComment,
    FaDownload,
    FaPlus,
    FaTrash,
    FaRegFolder,
    FaHistory,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { toast } from "react-hot-toast";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import PropTypes from "prop-types";
import useWatchLater from "../../hooks/useWatchLater";

const Home = () => {
    const { user } = useContext(AuthContext);
    const [videos, setVideos] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const watchLater = useWatchLater(user);
    const controller = useRef(new AbortController());

    const apiConfig = useMemo(
        () => ({
            headers: { Authorization: `Bearer ${user?.token}` },
            signal: controller.current.signal,
        }),
        [user?.token]
    );

    // Fetch initial data
    const fetchInitialData = useCallback(async () => {
        try {
            const [videosRes, historyRes, playlistsRes] = await Promise.all([
                axios.get("/api/v1/videos/", apiConfig),
                user
                    ? axios.get("/api/v1/users/history", apiConfig)
                    : { data: { data: { history: [] } } },
                user
                    ? axios.get("/api/v1/playlists", apiConfig)
                    : { data: { data: { playlists: [] } } },
            ]);

            setVideos(
                videosRes.data.data.videos.map((video) => ({
                    ...video,
                    isLiked: video.likes?.includes(user?._id),
                }))
            );

            setHistory(historyRes.data.data.history);
            setPlaylists(playlistsRes.data.data.playlists);
        } catch (error) {
            if (!axios.isCancel(error)) {
                toast.error(
                    error.response?.data?.message || "Failed to load data"
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [apiConfig, user]);

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            await fetchInitialData();
            if (user) watchLater.fetchWatchLater();
        };

        loadData();
        return () => controller.current.abort();
    }, [fetchInitialData, user, watchLater]);

    // Handle video actions
    const handleVideoAction = useCallback(
        async (action, videoId) => {
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
                    case "download": {
                        const { data } = await axios.get(
                            `/api/v1/videos/download/${videoId}`
                        );
                        window.open(data.url, "_blank");
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
        [videos, apiConfig, watchLater]
    );

    // Handle playlist operations
    const handlePlaylistOperations = useCallback(
        async (operation, playlistId) => {
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
        [selectedVideo, newPlaylistName, apiConfig]
    );

    const videoGridContent = useMemo(
        () =>
            isLoading
                ? [...Array(8)].map((_, i) => <VideoCardSkeleton key={i} />)
                : videos.map((video) => (
                      <VideoCard
                          key={video._id}
                          video={video}
                          onAction={handleVideoAction}
                          inWatchLater={watchLater.isInWatchLater(video._id)}
                          watchLaterLoading={watchLater.loading}
                      />
                  )),
        [isLoading, videos, handleVideoAction, watchLater]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <HeroSection />

                {/* History Section */}
                {user && (
                    <HistorySection
                        history={history}
                        watchLater={watchLater}
                        handleVideoAction={handleVideoAction}
                        onAction={handleVideoAction}
                        inWatchLater={watchLater.isInWatchLater}
                        watchLaterLoading={watchLater.loading}
                    />
                )}

                {/* Video Grid */}
                <VideoGridSection videoGridContent={videoGridContent} />

                {/* Playlist Modal */}
                <AnimatePresence>
                    {showPlaylistModal && (
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

// Hero Section
const HeroSection = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 rounded-2xl overflow-hidden border-2 border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-lg"
    >
        <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation
            loop
            className="relative group"
        >
            {[...Array(3)].map((_, i) => (
                <SwiperSlide key={i}>
                    <div className="relative h-[50vh] md:h-[70vh] flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                        <div className="relative z-10 text-center space-y-6">
                            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                StreamFlow
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                                Your gateway to endless video experiences
                            </p>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    </motion.div>
);

// History Section
const HistorySection = ({
    history,
    onAction,
    inWatchLater,
    watchLaterLoading,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-600 rounded-lg">
                <FaHistory className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Continue Watching</h2>
        </div>

        {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {history.map((video) => (
                    <VideoCard
                        key={video._id}
                        video={video}
                        onAction={onAction}
                        inWatchLater={inWatchLater(video._id)}
                        watchLaterLoading={watchLaterLoading}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-12 text-gray-400">
                No watch history available
            </div>
        )}
    </motion.div>
);

HistorySection.propTypes = {
    history: PropTypes.array.isRequired,
    onAction: PropTypes.func.isRequired,
    inWatchLater: PropTypes.func.isRequired,
    watchLaterLoading: PropTypes.bool.isRequired,
};

// Video Grid Section
const VideoGridSection = ({ videoGridContent }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
    >
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Trending Videos
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videoGridContent}
        </div>
    </motion.div>
);

VideoGridSection.propTypes = {
    videoGridContent: PropTypes.node.isRequired,
};

// Video Card
const VideoCard = React.memo(
    ({ video, onAction, inWatchLater, watchLaterLoading }) => {
        const formatDuration = useCallback((seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
        }, []);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all"
            >
                {/* Thumbnail Section */}
                <div className="relative aspect-video">
                    <img
                        src={video.thumbnail?.url || "/default-thumbnail.jpg"}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                    />

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent p-4 flex flex-col justify-between">
                        <div className="flex justify-end gap-2">
                            <WatchLaterButton
                                inWatchLater={inWatchLater}
                                watchLaterLoading={watchLaterLoading}
                                onAction={onAction}
                                videoId={video._id}
                            />
                            <button
                                className="p-2 hover:bg-gray-800/50 rounded-full"
                                onClick={() => onAction("playlist", video._id)}
                                aria-label="More options"
                            >
                                <FiMoreVertical className="text-xl" />
                            </button>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="bg-gray-900/80 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                                {formatDuration(video.duration)}
                            </div>
                            <button
                                className="bg-gray-900/80 p-2 rounded-full backdrop-blur-sm hover:bg-purple-600 transition-colors"
                                onClick={() => onAction("download", video._id)}
                                aria-label="Download video"
                            >
                                <FaDownload className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Info Section */}
                <VideoInfo video={video} onAction={onAction} />
            </motion.div>
        );
    }
);

VideoCard.propTypes = {
    video: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        thumbnail: PropTypes.shape({
            url: PropTypes.string,
        }),
        duration: PropTypes.number.isRequired,
        isLiked: PropTypes.bool,
        likes: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
        commentsCount: PropTypes.number,
        views: PropTypes.number,
        createdAt: PropTypes.string.isRequired,
        owner: PropTypes.shape({
            avatar: PropTypes.string,
            username: PropTypes.string,
        }),
    }).isRequired,
    onAction: PropTypes.func.isRequired,
    inWatchLater: PropTypes.bool.isRequired,
    watchLaterLoading: PropTypes.bool.isRequired,
};

// Video Info
const VideoInfo = ({ video, onAction }) => (
    <div className="p-4 space-y-3">
        <Link to={`/video/${video._id}`} className="block">
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-purple-400 transition-colors">
                {video.title}
            </h3>
        </Link>

        <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
                <button
                    className={`flex items-center gap-1 ${
                        video.isLiked ? "text-red-500" : "hover:text-white"
                    }`}
                    onClick={() => onAction("like", video._id)}
                >
                    <FaHeart /> {video.likes}
                </button>
                <div className="flex items-center gap-1">
                    <FaComment /> {video.commentsCount}
                </div>
                <div className="flex items-center gap-1">
                    <FaEye /> {video.views?.toLocaleString()}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <FaClock />
                {new Date(video.createdAt).toLocaleDateString()}
            </div>
        </div>

        <CreatorInfo owner={video.owner} />
    </div>
);

VideoInfo.propTypes = {
    video: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        isLiked: PropTypes.bool,
        likes: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
        commentsCount: PropTypes.number,
        views: PropTypes.number,
        createdAt: PropTypes.string.isRequired,
        owner: PropTypes.object,
    }).isRequired,
    onAction: PropTypes.func.isRequired,
};

// Creator Info
const CreatorInfo = ({ owner }) => (
    <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50">
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            {owner?.avatar ? (
                <img
                    src={owner.avatar}
                    alt="Creator"
                    className="rounded-full w-full h-full object-cover"
                />
            ) : (
                <FaUser className="text-gray-400" />
            )}
        </div>
        <p className="text-sm truncate">
            {owner?.username || "Unknown Creator"}
        </p>
    </div>
);

CreatorInfo.propTypes = {
    owner: PropTypes.shape({
        avatar: PropTypes.string,
        username: PropTypes.string,
    }),
};

// Watch Later Button
const WatchLaterButton = ({
    inWatchLater,
    watchLaterLoading,
    onAction,
    videoId,
}) => (
    <button
        className={`p-2 rounded-full relative transition-colors ${
            inWatchLater
                ? "bg-yellow-400 text-white"
                : "bg-gray-900/70 text-yellow-400 hover:bg-gray-800/70"
        }`}
        title={inWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
        onClick={(e) => {
            e.stopPropagation();
            onAction("watchlater", videoId);
        }}
        disabled={watchLaterLoading}
        aria-label={
            inWatchLater ? "Remove from Watch Later" : "Add to Watch Later"
        }
    >
        <FaClock className="text-lg" />
        {watchLaterLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
                <span className="loader" />
            </span>
        )}
    </button>
);

WatchLaterButton.propTypes = {
    inWatchLater: PropTypes.bool.isRequired,
    watchLaterLoading: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
    videoId: PropTypes.string.isRequired,
};

const VideoCardSkeleton = () => (
    <div className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-700" />
        <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-700 rounded w-4/5" />
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
        </div>
    </div>
);

const PlaylistModal = ({
    isOpen,
    onClose,
    playlists,
    newPlaylistName,
    setNewPlaylistName,
    onPlaylistAction,
}) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaRegFolder className="text-purple-400" />
                    Add to Playlist
                </h3>

                {/* Create New Playlist */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="New playlist name"
                        className="flex-1 bg-gray-700 rounded-lg p-3"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    <button
                        onClick={() => onPlaylistAction("create")}
                        className="bg-purple-600 hover:bg-purple-700 px-4 rounded-lg"
                    >
                        <FaPlus />
                    </button>
                </div>

                {/* Existing Playlists */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                        >
                            <span className="truncate">{playlist.name}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        onPlaylistAction("add", playlist._id)
                                    }
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    <FaPlus />
                                </button>
                                <button
                                    onClick={() =>
                                        onPlaylistAction("delete", playlist._id)
                                    }
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

PlaylistModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    playlists: PropTypes.array.isRequired,
    newPlaylistName: PropTypes.string.isRequired,
    setNewPlaylistName: PropTypes.func.isRequired,
    onPlaylistAction: PropTypes.func.isRequired,
};

// Add display names to components
VideoCard.displayName = "VideoCard";
PlaylistModal.displayName = "PlaylistModal";
VideoCardSkeleton.displayName = "VideoCardSkeleton";

export default Home;