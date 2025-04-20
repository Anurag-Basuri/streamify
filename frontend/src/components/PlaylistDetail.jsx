import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
const PlaylistDetail = () => {
    const { playlistID } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const { data } = await axios.get(
                    `/api/playlists/${playlistID}`
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
                    onClick={() => navigate(-1)} // Go back to previous page
                    className="mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <FaArrowLeft />
                    Back to Playlists
                </button>

                {playlist && (
                    <div className="space-y-8">
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
                                    {playlist.owner.username}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {playlist.videos.map((video) => (
                                <div
                                    key={video._id}
                                    className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
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
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PlaylistDetail;