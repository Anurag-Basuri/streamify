import React, { useState, useEffect, useRef } from "react";
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
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fetch playlists on component mount
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
                setPlaylists(data.data.playlists);
            } catch (err) {
                handleError(err, "Failed to fetch playlists");
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    const handleError = (err, defaultMessage) => {
        const message = err.response?.data?.message || defaultMessage;
        setError(message);
        toast.error(message);
    };

    // Clear error message after 5 seconds
    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!formData.name.trim()) {
            toast.error("Playlist name is required.");
            return;
        }

        try {
            // Show a loading toast while the request is being processed
            const loadingToastId = toast.loading("Creating playlist...");

            // Make the API request to create a playlist
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

            // Update the playlists state with the newly created playlist
            setPlaylists([data.data.playlist, ...playlists]);

            // Reset the form and close the modal
            setShowCreateModal(false);
            setFormData({ name: "", description: "" });

            // Show a success toast
            toast.success("Playlist created successfully 🎉", {
                id: loadingToastId,
            });
        } catch (err) {
            // Handle errors and show an error toast
            const errorMessage =
                err.response?.data?.message || "Failed to create playlist.";
            toast.error(errorMessage);
        }
    };

    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!formData.name.trim()) {
            toast.error("Playlist name is required.");
            return;
        }

        try {
            // Show a loading toast while the request is being processed
            const loadingToastId = toast.loading("Updating playlist...");

            // Make the API request to update the playlist
            const { data } = await axios.patch(
                `/api/v1/playlists/${selectedPlaylist._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );

            // Update the playlists state with the updated playlist
            setPlaylists(
                playlists.map((p) =>
                    p._id === data.data.playlist._id ? data.data.playlist : p
                )
            );

            // Reset the form and close the modal
            setShowEditModal(false);
            setFormData({ name: "", description: "" });

            // Show a success toast
            toast.success("Playlist updated successfully ✨", {
                id: loadingToastId,
            });
        } catch (err) {
            // Handle errors and show an error toast
            const errorMessage =
                err.response?.data?.message || "Failed to update playlist.";
            toast.error(errorMessage);
        }
    };

    const confirmDelete = (playlist) => {
        setPlaylistToDelete(playlist);
        setShowDeleteModal(true);
    };

    const handleDeletePlaylist = async () => {
        try {
            await axios.delete(
                `/api/v1/playlists/delete/${playlistToDelete._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylists(
                playlists.filter((p) => p._id !== playlistToDelete._id)
            );
            toast.success("Playlist deleted successfully 🗑️");
            setShowDeleteModal(false);
        } catch (err) {
            handleError(err, "Failed to delete playlist");
        }
    };

    const ThumbnailGrid = ({ videos = [] }) => {
        if (!videos.length)
            return (
                <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center group">
                    <div className="relative">
                        <FaFilm className="text-5xl text-gray-600 group-hover:text-purple-500 transition-colors" />
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl group-hover:opacity-50 opacity-0 transition-opacity" />
                    </div>
                </div>
            );

        return (
            <div className="grid grid-cols-2 gap-1 h-48 rounded-2xl overflow-hidden relative group">
                {videos.slice(0, 4).map((video, idx) => (
                    <motion.div
                        key={video._id || idx}
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                    >
                        <img
                            src={video.thumbnail || "/default-thumbnail.jpg"}
                            className="w-full h-full object-cover transform transition-transform duration-300"
                            alt="Video thumbnail"
                        />
                        {idx === 3 && videos.length > 4 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-2xl backdrop-blur-sm">
                                +{videos.length - 4}
                            </div>
                        )}
                    </motion.div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        );
    };

    const PlaylistCard = ({ playlist }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition-all shadow-2xl hover:shadow-purple-500/10"
        >
            <div className="relative mb-5 overflow-hidden rounded-xl">
                <ThumbnailGrid videos={playlist.videos || []} />
                <div className="absolute bottom-3 right-3 bg-gray-900/80 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {playlist.videos?.length || 0} videos
                </div>
            </div>

            <h3 className="text-xl font-bold truncate mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {playlist.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-5 min-h-[3rem]">
                {playlist.description || "No description provided"}
            </p>

            <div className="flex justify-between items-center">
                <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
                >
                    <span>Explore Playlist</span>
                    <FiChevronRight className="text-lg mt-0.5" />
                </motion.button>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setSelectedPlaylist(playlist);
                            setFormData({
                                name: playlist.name,
                                description: playlist.description,
                            });
                            setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-purple-400 transition-all"
                    >
                        <FaEdit className="text-lg" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDelete(playlist)}
                        className="p-2 hover:bg-gray-700 rounded-xl text-red-400 hover:text-red-300 transition-all"
                    >
                        <FaTrash className="text-lg" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );

    const ModalForm = ({ title, onSubmit, onClose }) => {
        const modalRef = useRef();

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    ref={modalRef}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-xl relative border border-gray-700/50 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm mb-3 text-gray-400">
                                Playlist Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-700/50 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 border border-gray-600/50 focus:border-purple-500 transition-all"
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
                            <label className="block text-sm mb-3 text-gray-400">
                                Description
                            </label>
                            <textarea
                                className="w-full bg-gray-700/50 rounded-xl p-4 h-32 focus:ring-2 focus:ring-purple-500 border border-gray-600/50 focus:border-purple-500 transition-all"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                className="px-6 py-3 hover:bg-gray-700/50 rounded-xl transition-all"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-xl font-medium hover:shadow-purple-500/20 hover:shadow-lg transition-all"
                            >
                                {title.includes("Create")
                                    ? "Create Playlist 🎬"
                                    : "Save Changes ✨"}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-12 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-2xl backdrop-blur-lg border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm">
                            <FaListUl className="text-3xl text-purple-400" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            My Collections
                        </h1>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-xl font-medium flex items-center gap-3 hover:shadow-purple-500/30 hover:shadow-lg transition-all"
                    >
                        <FaPlus className="text-lg" />
                        New Playlist
                    </motion.button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gray-800 rounded-2xl p-5"
                                >
                                    <div className="animate-pulse bg-gray-700/50 h-48 rounded-2xl mb-5 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent -translate-x-full animate-shimmer" />
                                    </div>
                                    <div className="h-6 bg-gray-700/50 rounded-xl w-3/4 mb-4" />
                                    <div className="h-4 bg-gray-700/50 rounded-xl w-full mb-2" />
                                    <div className="h-4 bg-gray-700/50 rounded-xl w-2/3" />
                                </motion.div>
                            ))
                        ) : playlists?.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full text-center py-20 space-y-6"
                            >
                                <div className="inline-flex flex-col items-center">
                                    <FaRegSadTear className="text-6xl text-purple-400 mb-4" />
                                    <div className="text-4xl mb-2">📼</div>
                                </div>
                                <h2 className="text-2xl text-gray-300">
                                    No Playlists Found
                                </h2>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Start by creating your first collection of
                                    awesome videos!
                                </p>
                            </motion.div>
                        ) : (
                            playlists?.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Delete Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-red-500/20 relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex bg-red-500/20 p-4 rounded-2xl mb-4">
                                        <FaTrash className="text-3xl text-red-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        Delete Playlist?
                                    </h2>
                                    <p className="text-gray-400">
                                        This will permanently delete "
                                        {playlistToDelete?.name}"
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-6 py-3 hover:bg-gray-700/50 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={handleDeletePlaylist}
                                        className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-medium"
                                    >
                                        Confirm Delete
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Playlist;
