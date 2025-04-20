/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";

const PlaylistDetail = () => {
    const { playlistID } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Fetch playlist details
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const { data } = await axios.get(
                    `/api/v1/playlists/${playlistID}`
                );
                setPlaylist(data.data);
                setError("");
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to load playlist"
                );
                toast.error(
                    err.response?.data?.message || "Failed to load playlist"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [playlistID]);

    // Debounced video search
    const searchVideos = debounce(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            setIsSearching(true);
            setShowSearchResults(true);
            const { data } = await axios.get(`/api/v1/videos/search`, {
                params: { query },
            });
            setSearchResults(data.data);
        } catch (err) {
            toast.error("Failed to search videos");
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, 500);

    useEffect(() => {
        searchVideos(searchQuery);
        return () => searchVideos.cancel();
    }, [searchQuery]);

    // Add video to playlist
    const handleAddVideo = async (videoId) => {
        try {
            const { data } = await axios.post(
                `/api/v1/playlists/${playlistID}/videos/${videoId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );

            setPlaylist((prev) => ({
                ...prev,
                videos: [...prev.videos, data.data],
            }));
            toast.success("Video added to playlist");
            setSearchQuery("");
            setShowSearchResults(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add video");
        }
    };

    // Remove video from playlist
    const handleRemoveVideo = async (videoId) => {
        try {
            await axios.delete(
                `/api/v1/playlists/${playlistID}/videos/${videoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );

            setPlaylist((prev) => ({
                ...prev,
                videos: prev.videos.filter((v) => v._id !== videoId),
            }));
            toast.success("Video removed from playlist");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to remove video"
            );
        }
    };

    // Check if user is playlist owner
    const isOwner = currentUser?._id === playlist?.owner?._id;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="animate-spin text-4xl text-purple-400" />
                    <p className="text-gray-400">Loading playlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="text-red-400 text-xl mb-4">{error}</div>
                <button
                    onClick={() => navigate("/playlists")}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaArrowLeft />
                    Back to Playlists
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-900 text-white p-4 sm:p-8"
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
                            className="bg-gray-800 rounded-xl p-6 relative overflow-hidden"
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
                                    {playlist.owner.userName}
                                </span>
                            </div>
                        </motion.div>

                        {/* Video Search (only for owner) */}
                        {isOwner && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-800 rounded-xl p-6 space-y-4"
                            >
                                <h2 className="text-2xl font-semibold">
                                    Add Videos
                                </h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search videos by title, description, or tags..."
                                        className="w-full bg-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    <FaSearch className="absolute left-4 top-4 text-gray-400" />
                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setShowSearchResults(false);
                                            }}
                                            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>

                                {/* Search Results */}
                                {showSearchResults && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gray-700 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto"
                                    >
                                        {isSearching ? (
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
                                                    className="flex items-center justify-between bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={
                                                                video.thumbnail
                                                            }
                                                            alt={video.title}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {video.title}
                                                            </span>
                                                            <span className="text-sm text-gray-400 line-clamp-1">
                                                                {
                                                                    video.description
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleAddVideo(
                                                                video._id
                                                            )
                                                        }
                                                        disabled={playlist.videos.some(
                                                            (v) =>
                                                                v._id ===
                                                                video._id
                                                        )}
                                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <FaPlus />
                                                        {playlist.videos.some(
                                                            (v) =>
                                                                v._id ===
                                                                video._id
                                                        )
                                                            ? "Added"
                                                            : "Add"}
                                                    </button>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-center py-4">
                                                No videos found for &ldquo;
                                                {searchQuery}&rdquo;
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* Playlist Videos */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <h2 className="text-2xl font-semibold">
                                Videos ({playlist.videos.length})
                            </h2>

                            {playlist.videos.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {playlist.videos.map((video, index) => (
                                        <motion.div
                                            key={video._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors group relative"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                                />
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/video/${video._id}`
                                                        )
                                                    }
                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                >
                                                    <FaPlay className="text-4xl text-white" />
                                                </button>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">
                                                {video.title}
                                            </h3>
                                            <p className="text-gray-400 line-clamp-3">
                                                {video.description}
                                            </p>
                                            {isOwner && (
                                                <button
                                                    onClick={() =>
                                                        handleRemoveVideo(
                                                            video._id
                                                        )
                                                    }
                                                    className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaTrash className="text-white" />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
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
                                    {isOwner && (
                                        <p className="text-gray-500">
                                            Use the search above to add videos
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