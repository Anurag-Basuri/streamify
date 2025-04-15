import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaFilm, FaListUl } from "react-icons/fa";
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
        try {
            const { data } = await axios.post("/api/v1/playlists", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
            });
            setPlaylists([data.data.playlist, ...playlists]);
            setShowCreateModal(false);
            setFormData({ name: "", description: "" });
            toast.success("Playlist created successfully 🎉");
        } catch (err) {
            handleError(err, "Failed to create playlist");
        }
    };

    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        try {
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
            setPlaylists(
                playlists.map((p) =>
                    p._id === data.data.playlist._id ? data.data.playlist : p
                )
            );
            setShowEditModal(false);
            toast.success("Playlist updated successfully ✨");
        } catch (err) {
            handleError(err, "Failed to update playlist");
        }
    };

    const confirmDelete = (playlist) => {
        setPlaylistToDelete(playlist);
        setShowDeleteModal(true);
    };

    const handleDeletePlaylist = async () => {
        try {
            await axios.delete(`/api/v1/playlists/${playlistToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
            });
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
                <div className="w-full h-40 bg-gray-700 rounded-xl flex items-center justify-center">
                    <FaFilm className="text-4xl text-gray-500" />
                </div>
            );

        return (
            <div className="grid grid-cols-2 gap-1 h-40 rounded-xl overflow-hidden">
                {videos.slice(0, 4).map((video, idx) => (
                    <div key={video._id || idx} className="relative">
                        <img
                            src={video.thumbnail || "/default-thumbnail.jpg"}
                            className="w-full h-full object-cover"
                            alt="Video thumbnail"
                        />
                        {idx === 3 && videos.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-2xl">
                                +{videos.length - 4}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const PlaylistCard = ({ playlist }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-all"
        >
            <div className="relative mb-4">
                <ThumbnailGrid videos={playlist.videos || []} />
                <div className="absolute bottom-2 right-2 bg-gray-900/80 px-2 py-1 rounded-full text-sm">
                    {playlist.videos?.length || 0} videos
                </div>
            </div>

            <h3 className="text-lg font-semibold truncate mb-1">
                {playlist.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {playlist.description || "No description"}
            </p>

            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                    View Playlist <FiChevronRight className="mt-0.5" />
                </button>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => {
                            setSelectedPlaylist(playlist);
                            setFormData({
                                name: playlist.name,
                                description: playlist.description,
                            });
                            setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                        aria-label="Edit playlist"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => confirmDelete(playlist)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                        aria-label="Delete playlist"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    const ModalForm = ({ title, onSubmit, onClose }) => {
        const modalRef = useRef();

        useEffect(() => {
            modalRef.current?.focus();
        }, []);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    ref={modalRef}
                    tabIndex={-1}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        {title}
                    </h2>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-2">
                                Playlist Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
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
                            <label className="block text-sm mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full bg-gray-700 rounded-lg p-3 h-24 focus:ring-2 focus:ring-purple-500"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
                            >
                                {title.includes("Create") ? "Create" : "Save"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaListUl className="text-purple-500" />
                        Your Playlists
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                        <FaPlus /> Create New
                    </motion.button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gray-800 rounded-xl p-4"
                                >
                                    <div className="animate-pulse bg-gray-700 h-40 rounded-xl mb-4" />
                                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
                                    <div className="h-4 bg-gray-700 rounded w-full mb-2" />
                                    <div className="h-4 bg-gray-700 rounded w-2/3" />
                                </motion.div>
                            ))
                        ) : playlists?.length === 0 ? ( // Use optional chaining to avoid errors
                            <div className="col-span-full text-center py-12">
                                <div className="text-6xl mb-4">🎥</div>
                                <p className="text-xl text-gray-400">
                                    No playlists found. Start creating!
                                </p>
                            </div>
                        ) : (
                            playlists?.map(
                                (
                                    playlist // Use optional chaining here as well
                                ) => (
                                    <PlaylistCard
                                        key={playlist._id}
                                        playlist={playlist}
                                    />
                                )
                            )
                        )}
                    </AnimatePresence>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showCreateModal && (
                        <ModalForm
                            title="Create New Playlist"
                            onSubmit={handleCreatePlaylist}
                            onClose={() => setShowCreateModal(false)}
                        />
                    )}
                    {showEditModal && (
                        <ModalForm
                            title="Edit Playlist"
                            onSubmit={handleUpdatePlaylist}
                            onClose={() => setShowEditModal(false)}
                        />
                    )}
                    {showDeleteModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-6">
                                    Confirm Delete
                                </h2>
                                <p className="text-gray-400 mb-6">
                                    Are you sure you want to delete the playlist{" "}
                                    <span className="text-white font-semibold">
                                        {playlistToDelete?.name}
                                    </span>
                                    ?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeletePlaylist}
                                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
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
