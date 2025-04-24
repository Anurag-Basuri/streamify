import { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../services/AuthContext.jsx";
import {
    FaPlay,
    FaEye,
    FaClock,
    FaUser,
    FaHeart,
    FaComment,
    FaDownload,
    FaPlus,
    FaList,
    FaTrash,
    FaRegFolder,
    FaHistory,
} from "react-icons/fa";
import { FiChevronRight, FiMoreVertical } from "react-icons/fi";
import { toast } from "react-hot-toast";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import PropTypes from "prop-types";
import useWatchLater from "../../hooks/useWatchLater";
import React from "react";

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

    const apiConfig = useMemo(() => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    }), [user?.token]);

    const fetchInitialData = useCallback(async () => {
        try {
            const [videosRes, historyRes, playlistsRes] = await Promise.all([
                axios.get("/api/v1/videos/", apiConfig),
                axios.get("/api/v1/users/history", apiConfig),
                axios.get("/api/v1/playlists", apiConfig)
            ]);

            setVideos(videosRes.data.data.videos.map(video => ({
                ...video,
                isLiked: video.likes?.includes(user?._id)
            })));

            setHistory(historyRes.data.data.history);
            setPlaylists(playlistsRes.data.data.playlists);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, [apiConfig, user?._id]);

    useEffect(() => {
        const loadData = async () => {
            await fetchInitialData();
            watchLater.fetchWatchLater();
        };
        loadData();
    }, [fetchInitialData, watchLater]);

    const handleVideoAction = useCallback(async (action, videoId) => {
        try {
            switch (action) {
                case "like": {
                    const updatedVideos = videos.map(video => 
                        video._id === videoId ? {
                            ...video,
                            isLiked: !video.isLiked,
                            likes: video.isLiked ? video.likes - 1 : video.likes + 1
                        } : video
                    );
                    setVideos(updatedVideos);
                    await axios.post(`/api/v1/likes/video/${videoId}`, {}, apiConfig);
                    break;
                }
                case "download": {
                    const { data } = await axios.get(`/api/v1/videos/download/${videoId}`);
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
                    await axios.post(
                        `/api/v1/playlists/${playlists[0]?._id}/videos/${selectedVideo._id}`,
                        {},
                        apiConfig
                    );
                    toast.success("Added to playlist!");
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    }, [videos, apiConfig, watchLater]);

    const handlePlaylistOperations = useCallback(async (operation, playlistId) => {
        try {
            if (!selectedVideo) return;

            switch (operation) {
                case "add": {
                    await axios.post(
                        `/api/v1/playlists/${playlistId}/videos/${selectedVideo._id}`,
                        {},
                        apiConfig
                    );
                    toast.success("Added to playlist!");
                    break;
                }
                case "delete": {
                    await axios.delete(`/api/v1/playlists/${playlistId}`, apiConfig);
                    setPlaylists(playlists => playlists.filter(p => p._id !== playlistId));
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
                default:
                    break;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    }, [selectedVideo, apiConfig, playlists, newPlaylistName]);

    const videoGridContent = useMemo(() => (
        isLoading ? (
            [...Array(8)].map((_, i) => <VideoCardSkeleton key={i} />)
        ) : (
            videos.map(video => (
                <VideoCard
                    key={video._id}
                    video={video}
                    onAction={handleVideoAction}
                    inWatchLater={watchLater.isInWatchLater(video._id)}
                    watchLaterLoading={watchLater.loading}
                />
            ))
        )
    ), [isLoading, videos, handleVideoAction, watchLater]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
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
                                            Your gateway to endless video
                                            experiences
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>

                {/* History Section */}
                {user && history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <FaHistory className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">
                                Continue Watching
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {history.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    onAction={(action) => {
                                        setSelectedVideo(video);
                                        action === "playlist"
                                            ? setShowPlaylistModal(true)
                                            : handleVideoAction(
                                                  action,
                                                  video._id
                                              );
                                    }}
                                    inWatchLater={watchLater.isInWatchLater(video._id)}
                                    watchLaterLoading={watchLater.loading}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Video Grid */}
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

                {/* Playlist Modal */}
                <AnimatePresence>
                    {showPlaylistModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setShowPlaylistModal(false)}
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
                                        onChange={(e) =>
                                            setNewPlaylistName(e.target.value)
                                        }
                                    />
                                    <button
                                        onClick={() =>
                                            handlePlaylistOperations("create")
                                        }
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
                                            <span className="truncate">
                                                {playlist.name}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handlePlaylistOperations(
                                                            "add",
                                                            playlist._id
                                                        )
                                                    }
                                                    className="text-purple-400 hover:text-purple-300"
                                                >
                                                    <FaPlus />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePlaylistOperations(
                                                            "delete",
                                                            playlist._id
                                                        )
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
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const VideoCard = React.memo(({ video, onAction, inWatchLater, watchLaterLoading }) => {
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

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
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent p-4 flex flex-col justify-between">
                    {/* Top Bar */}
                    <div className="flex justify-end gap-2">
                        {/* Watch Later Button */}
                        <button
                            className={`p-2 rounded-full ${inWatchLater ? 'bg-yellow-400 text-white' : 'bg-gray-900/70 text-yellow-400 hover:bg-gray-800/70'} relative`}
                            title={inWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onAction("watchlater", video._id);
                            }}
                            disabled={watchLaterLoading}
                        >
                            <FaClock className="text-lg" />
                            {watchLaterLoading && <span className="absolute inset-0 flex items-center justify-center"><span className="loader" /></span>}
                        </button>
                        <button
                            className="p-2 hover:bg-gray-800/50 rounded-full"
                            onClick={() => onAction("playlist")}
                        >
                            <FiMoreVertical className="text-xl" />
                        </button>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex justify-between items-end">
                        <div className="bg-gray-900/80 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                            {formatDuration(video.duration)}
                        </div>
                        <button
                            className="bg-gray-900/80 p-2 rounded-full backdrop-blur-sm hover:bg-purple-600 transition-colors"
                            onClick={() => onAction("download")}
                        >
                            <FaDownload className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Info */}
            <div className="p-4 space-y-3">
                <Link to={`/video/${video._id}`} className="block">
                    <h3 className="font-semibold text-lg line-clamp-2 hover:text-purple-400 transition-colors">
                        {video.title}
                    </h3>
                </Link>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                        <button
                            className={`flex items-center gap-1 ${
                                video.isLiked
                                    ? "text-red-500"
                                    : "hover:text-white"
                            }`}
                            onClick={() => onAction("like")}
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

                {/* Creator Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        {video.owner?.avatar ? (
                            <img
                                src={video.owner.avatar}
                                alt="Creator"
                                className="rounded-full"
                            />
                        ) : (
                            <FaUser className="text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm truncate">
                            {video.owner?.username || "Unknown Creator"}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

VideoCard.propTypes = {
    video: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        thumbnail: PropTypes.shape({
            url: PropTypes.string,
        }),
        duration: PropTypes.number.isRequired,
        isLiked: PropTypes.bool,
        likes: PropTypes.number,
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

const PlaylistModal = ({ isOpen, onClose, playlists, newPlaylistName, setNewPlaylistName, onPlaylistAction }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
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
                        onChange={(e) =>
                            setNewPlaylistName(e.target.value)
                        }
                    />
                    <button
                        onClick={() =>
                            onPlaylistAction("create")
                        }
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
                            <span className="truncate">
                                {playlist.name}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        onPlaylistAction(
                                            "add",
                                            playlist._id
                                        )
                                    }
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    <FaPlus />
                                </button>
                                <button
                                    onClick={() =>
                                        onPlaylistAction(
                                            "delete",
                                            playlist._id
                                        )
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

export default Home;
