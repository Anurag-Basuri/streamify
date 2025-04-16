import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFilm,
    FaListUl,
    FaRegSadTear,
    FaCheckCircle,
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const { data } = await axios.get("/api/v1/playlists", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });
                setPlaylists(data.data);
                setLoading(false);
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Failed to fetch playlists"
                );
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    // Create playlist
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                "/api/v1/playlists/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylists([data.data, ...playlists]);
            setShowCreateModal(false);
            toast.success("Playlist created successfully");
            setFormData({ name: "", description: "" });
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create playlist"
            );
        }
    };

    // Update playlist
    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(
                `/api/v1/playlists/update/${selectedPlaylist._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylists(
                playlists.map((p) => (p._id === data.data._id ? data.data : p))
            );
            setShowEditModal(false);
            toast.success("Playlist updated successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update playlist"
            );
        }
    };

    // Delete playlist
    const handleDeletePlaylist = async () => {
        try {
            await axios.delete(
                `/api/v1/playlists/delete/${selectedPlaylist._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylists(
                playlists.filter((p) => p._id !== selectedPlaylist._id)
            );
            setShowDeleteModal(false);
            toast.success("Playlist deleted successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to delete playlist"
            );
        }
    };

    // Thumbnail grid component
    const ThumbnailGrid = ({ videos }) => {
        if (!videos?.length)
            return (
                <div className="w-full h-48 bg-gray-800 rounded-xl flex items-center justify-center">
                    <FaFilm className="text-4xl text-gray-600" />
                </div>
            );

        return (
            <div className="grid grid-cols-2 gap-2 h-48 rounded-xl overflow-hidden">
                {videos.slice(0, 4).map((video, index) => (
                    <div key={index} className="relative aspect-video">
                        <img
                            src={video.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                        />
                        {index === 3 && videos.length > 4 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xl">
                                +{videos.length - 4}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Playlist card component
    const PlaylistCard = ({ playlist }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
        >
            <div className="mb-4 relative">
                <ThumbnailGrid videos={playlist.videos} />
                <div className="absolute bottom-2 right-2 bg-gray-900/80 px-3 py-1 rounded-full text-sm">
                    {playlist.videos?.length || 0} videos
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-2 truncate">
                {playlist.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {playlist.description || "No description"}
            </p>

            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                >
                    View Playlist
                    <FiChevronRight className="mt-1" />
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setSelectedPlaylist(playlist);
                            setFormData({
                                name: playlist.name,
                                description: playlist.description,
                            });
                            setShowEditModal(true);
                        }}
                        className="text-gray-400 hover:text-purple-400"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedPlaylist(playlist);
                            setShowDeleteModal(true);
                        }}
                        className="text-gray-400 hover:text-red-400"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // Modal component
    const Modal = ({ title, children, onClose }) => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <FaListUl className="text-4xl text-purple-400" />
                        <h1 className="text-3xl font-bold">Your Playlists</h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                        <FaPlus /> New Playlist
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-800 rounded-xl p-6 animate-pulse"
                            >
                                <div className="h-48 bg-gray-700 rounded-xl mb-4" />
                                <div className="h-6 bg-gray-700 rounded mb-3 w-3/4" />
                                <div className="h-4 bg-gray-700 rounded mb-2 w-full" />
                                <div className="h-4 bg-gray-700 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-20">
                        <FaRegSadTear className="text-6xl mx-auto mb-4 text-gray-600" />
                        <h2 className="text-2xl mb-2">No Playlists Found</h2>
                        <p className="text-gray-400">
                            Create your first playlist to get started
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {playlists.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <Modal
                            title="Create Playlist"
                            onClose={() => setShowCreateModal(false)}
                        >
                            <form
                                onSubmit={handleCreatePlaylist}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block mb-2">Name</label>
                                    <input
                                        required
                                        className="w-full bg-gray-700 rounded-lg p-3"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full bg-gray-700 rounded-lg p-3 h-32"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
                                    >
                                        Create Playlist
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && (
                        <Modal
                            title="Edit Playlist"
                            onClose={() => setShowEditModal(false)}
                        >
                            <form
                                onSubmit={handleUpdatePlaylist}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block mb-2">Name</label>
                                    <input
                                        required
                                        className="w-full bg-gray-700 rounded-lg p-3"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full bg-gray-700 rounded-lg p-3 h-32"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </AnimatePresence>

                {/* Delete Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <Modal
                            title="Delete Playlist"
                            onClose={() => setShowDeleteModal(false)}
                        >
                            <div className="text-center">
                                <FaCheckCircle className="text-4xl text-red-400 mx-auto mb-4" />
                                <p className="mb-6">
                                    Are you sure you want to delete this
                                    playlist?
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeletePlaylist}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Playlist;
