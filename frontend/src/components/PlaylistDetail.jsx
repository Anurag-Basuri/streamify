import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSpinner, FaSearch, FaPlus } from "react-icons/fa";
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
            return;
        }

        try {
            setIsSearching(true);
            const { data } = await axios.get(`/api/v1/videos/search`, {
                params: { query },
            });
            setSearchResults(data.data);
        } catch (error) {
            toast.error("Failed to search videos");
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
            const { data } = await axios.put(
                `/api/v1/playlists/${playlistID}/add-video`,
                { videoId },
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
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add video");
        }
    };

    // Check if user is playlist owner
    const isOwner = currentUser?._id === playlist?.owner?._id;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-purple-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="text-red-400 text-xl mb-4">{error}</div>
                <button
                    onClick={() => navigate("/playlists")}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
                >
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
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h1 className="text-3xl font-bold mb-4">
                                {playlist.name}
                            </h1>
                            <p className="text-gray-400 mb-6">
                                {playlist.description ||
                                    "No description available"}
                            </p>

                            <div className="flex items-center gap-3 text-gray-400">
                                <span>Created by:</span>
                                <span className="text-purple-400">
                                    {playlist.owner.userName}
                                </span>
                            </div>
                        </div>

                        {/* Video Search (only for owner) */}
                        {isOwner && (
                            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    Add Videos
                                </h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search videos..."
                                        className="w-full bg-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    <FaSearch className="absolute left-4 top-4 text-gray-400" />
                                </div>

                                {/* Search Results */}
                                {searchQuery && (
                                    <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                                        {isSearching ? (
                                            <div className="flex justify-center py-4">
                                                <FaSpinner className="animate-spin text-purple-400" />
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((video) => (
                                                <div
                                                    key={video._id}
                                                    className="flex items-center justify-between bg-gray-600 rounded-lg p-4"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={
                                                                video.thumbnail
                                                            }
                                                            alt={video.title}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                        <span className="font-medium">
                                                            {video.title}
                                                        </span>
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
                                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-center py-4">
                                                No videos found for "
                                                {searchQuery}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Playlist Videos */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">
                                Videos ({playlist.videos.length})
                            </h2>

                            {playlist.videos.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {playlist.videos.map((video) => (
                                        <div
                                            key={video._id}
                                            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors group relative"
                                        >
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                            />
                                            <h3 className="text-xl font-semibold mb-2">
                                                {video.title}
                                            </h3>
                                            <p className="text-gray-400 line-clamp-3">
                                                {video.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-800 rounded-xl p-8 text-center">
                                    <p className="text-gray-400 text-xl">
                                        No videos in this playlist yet
                                    </p>
                                    {isOwner && (
                                        <p className="text-gray-500 mt-2">
                                            Use the search above to add videos
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PlaylistDetail;