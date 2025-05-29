/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFilm,
    FaListUl,
    FaRegSadTear,
    FaExclamationTriangle,
    FaTimes,
    FaSpinner,
    FaPlay,
    FaClock,
    FaEye,
} from "react-icons/fa";
import { FiChevronRight, FiCalendar } from "react-icons/fi";
import PropTypes from "prop-types";
import usePlaylist from "../../hooks/usePlaylist";
import useAuth from "../../hooks/useAuth";

const Playlist = () => {
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const navigate = useNavigate();
    
    // Use the custom hook to get user authentication context
    const { user } = useAuth();

    // Use the custom hook with proper auth context (you may need to adjust this)
    const {
        playlists,
        loading,
        error,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        fetchUserPlaylists,
        clearError,
    } = usePlaylist(null, user);

    // Fetch playlists on component mount
    useEffect(() => {
        fetchUserPlaylists();
    }, [fetchUserPlaylists]);

    // Reset form when modals close
    useEffect(() => {
        if (!showCreateModal && !showEditModal) {
            setFormData({ name: "", description: "" });
        }
    }, [showCreateModal, showEditModal]);

    // Clear errors when they exist
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    // Create Playlist Handler
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Playlist name is required");
            return;
        }

        const success = await createPlaylist(formData);
        if (success) {
            setShowCreateModal(false);
            setFormData({ name: "", description: "" });
        }
    };

    // Update Playlist Handler
    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        if (!selectedPlaylist) return;

        const success = await updatePlaylist(selectedPlaylist._id, formData);
        if (success) {
            setShowEditModal(false);
            setSelectedPlaylist(null);
            setFormData({ name: "", description: "" });
        }
    };

    // Delete Playlist Handler
    const handleDeletePlaylist = async () => {
        if (!selectedPlaylist) return;

        const success = await deletePlaylist(selectedPlaylist._id);
        if (success) {
            setShowDeleteModal(false);
            setSelectedPlaylist(null);
        }
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Calculate total duration helper
    const calculateTotalDuration = (videos) => {
        if (!videos?.length) return "0 min";

        // Filter out null/undefined videos and those without duration
        const totalSeconds = videos.reduce((acc, video) => {
            if (video && typeof video.duration === "number") {
                return acc + video.duration;
            }
            return acc;
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Enhanced Thumbnail Grid with better animations and states
    const ThumbnailGrid = ({ videos = [] }) => {
        const handleImageError = (e) => {
            e.target.src = "/fallback-thumbnail.jpg";
            e.target.onerror = null;
        };

        // Only use videos that are valid objects with an _id
        const validVideos = (videos || []).filter((v) => v && v._id);
        const videoCount = validVideos.length;

        return (
            <div className="relative h-48 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                {videoCount > 0 ? (
                    <div className="grid grid-cols-2 gap-1 h-full p-1">
                        {validVideos.slice(0, 4).map((video, index) => (
                            <motion.div
                                key={`${video._id}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative aspect-video rounded-lg overflow-hidden"
                            >
                                <img
                                    src={
                                        video.thumbnail ||
                                        "/fallback-thumbnail.jpg"
                                    }
                                    alt={`Thumbnail for ${video.title}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                                {index === 3 && videoCount > 4 && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-lg font-semibold backdrop-blur-sm">
                                        +{videoCount - 4}
                                    </div>
                                )}
                                {/* Play icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                    <FaPlay className="text-white text-lg" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="relative w-20 h-20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full" />
                            <div className="absolute inset-2 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full" />
                            <div className="absolute inset-4 bg-gradient-to-br from-purple-500/40 to-blue-500/40 rounded-full" />
                            <FaFilm className="absolute inset-0 m-auto text-3xl text-purple-400" />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                Empty Playlist
                            </p>
                            <p className="text-xs opacity-75">
                                Add videos to get started
                            </p>
                        </div>
                    </div>
                )}

                {/* Enhanced video count badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium border border-gray-600">
                    {videoCount} {videoCount === 1 ? "video" : "videos"}
                </div>
            </div>
        );
    };

    ThumbnailGrid.propTypes = {
        videos: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                thumbnail: PropTypes.string,
                title: PropTypes.string,
                duration: PropTypes.number,
            })
        ),
    };

    // Enhanced Playlist Card with better animations and information
    const PlaylistCard = ({ playlist }) => {
        if (!playlist) return null;

        const videoCount = playlist.videos?.length || 0;
        const totalDuration = calculateTotalDuration(playlist.videos);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 hover:from-gray-750 hover:to-gray-800 transition-all duration-300 group shadow-lg hover:shadow-2xl border border-gray-700/50 hover:border-purple-500/30"
            >
                {/* Thumbnail Section */}
                <div
                    className="mb-4 cursor-pointer relative"
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    aria-label={`View ${playlist.name} playlist`}
                >
                    <ThumbnailGrid videos={playlist.videos || []} />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                        <div className="bg-purple-600 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <FaPlay className="text-white text-lg ml-1" />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <h3
                            className="text-xl font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors duration-200"
                            title={playlist.name}
                        >
                            {playlist.name}
                        </h3>

                        {/* Action buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPlaylist(playlist);
                                    setFormData({
                                        name: playlist.name,
                                        description: playlist.description || "",
                                    });
                                    setShowEditModal(true);
                                }}
                                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                                aria-label={`Edit ${playlist.name} playlist`}
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPlaylist(playlist);
                                    setShowDeleteModal(true);
                                }}
                                className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                                aria-label={`Delete ${playlist.name} playlist`}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <p
                        className="text-gray-400 text-sm line-clamp-2 min-h-[2.5rem]"
                        title={playlist.description || "No description"}
                    >
                        {playlist.description || "No description provided"}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <FaClock />
                            <span>{totalDuration}</span>
                        </div>
                        {playlist.createdAt && (
                            <div className="flex items-center gap-1">
                                <FiCalendar />
                                <span>{formatDate(playlist.createdAt)}</span>
                            </div>
                        )}
                        {playlist.views && (
                            <div className="flex items-center gap-1">
                                <FaEye />
                                <span>{playlist.views.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* View Playlist Button */}
                    <button
                        onClick={() => navigate(`/playlist/${playlist._id}`)}
                        className="flex items-center justify-between w-full mt-3 p-3 rounded-lg bg-gray-700/50 hover:bg-purple-600/20 border border-gray-600 hover:border-purple-500/50 transition-all duration-200 group-hover:bg-purple-600/10"
                        aria-label={`View ${playlist.name} playlist`}
                    >
                        <span className="text-purple-400 font-medium">
                            View Playlist
                        </span>
                        <div className="flex items-center gap-2 text-purple-400">
                            <span className="text-sm">{videoCount} videos</span>
                            <FiChevronRight className="transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    </button>
                </div>
            </motion.div>
        );
    };

    PlaylistCard.propTypes = {
        playlist: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            createdAt: PropTypes.string,
            views: PropTypes.number,
            videos: PropTypes.arrayOf(
                PropTypes.shape({
                    _id: PropTypes.string,
                    thumbnail: PropTypes.string,
                    title: PropTypes.string,
                    duration: PropTypes.number,
                })
            ),
        }).isRequired,
    };

    // Enhanced Modal Component
    const Modal = ({ title, children, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 w-full max-w-md relative shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
                    aria-label="Close modal"
                >
                    <FaTimes className="text-lg" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
                {children}
            </motion.div>
        </motion.div>
    );

    Modal.propTypes = {
        title: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    // Enhanced Form Components
    const PlaylistForm = ({ isEdit = false }) => {
        const [localFormData, setLocalFormData] = useState(formData);
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
            setLocalFormData(formData);
        }, [formData]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSubmitting(true);

            try {
                if (isEdit) {
                    await handleUpdatePlaylist(localFormData);
                } else {
                    await handleCreatePlaylist(localFormData);
                }
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <Modal
                title={isEdit ? "Edit Playlist" : "Create New Playlist"}
                onClose={() =>
                    isEdit ? setShowEditModal(false) : setShowCreateModal(false)
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Playlist Name *
                        </label>
                        <input
                            required
                            minLength={1}
                            maxLength={100}
                            className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none border border-gray-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                            value={localFormData.name}
                            onChange={(e) =>
                                setLocalFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder={
                                isEdit
                                    ? "Enter playlist name"
                                    : "My Awesome Playlist"
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Description
                        </label>
                        <textarea
                            maxLength={500}
                            rows={4}
                            className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none border border-gray-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                            value={localFormData.description}
                            onChange={(e) =>
                                setLocalFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="What's this playlist about? (optional)"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {localFormData.description.length}/500 characters
                        </div>
                    </div>
                    <hr className="border-gray-700 my-2" />
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() =>
                                isEdit
                                    ? setShowEditModal(false)
                                    : setShowCreateModal(false)
                            }
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                            disabled={
                                isSubmitting ||
                                !localFormData.name.trim() ||
                                (isEdit &&
                                    localFormData.name.trim() ===
                                        (selectedPlaylist?.name || "") &&
                                    localFormData.description.trim() ===
                                        (selectedPlaylist?.description || ""))
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    {isEdit ? "Saving..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    {isEdit
                                        ? "Save Changes"
                                        : "Create Playlist"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    };

    PlaylistForm.propTypes = {
        isEdit: PropTypes.bool,
    };

    // Enhanced Delete Modal
    const DeleteModal = () => {
        const [isDeleting, setIsDeleting] = useState(false);

        const handleDelete = async () => {
            setIsDeleting(true);
            try {
                await handleDeletePlaylist();
            } finally {
                setIsDeleting(false);
            }
        };

        return (
            <Modal
                title="Confirm Deletion"
                onClose={() => setShowDeleteModal(false)}
            >
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                        }}
                        className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"
                    >
                        <FaExclamationTriangle className="text-2xl text-red-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2 text-white">
                        Delete Playlist
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Are you sure you want to permanently delete{" "}
                        <span className="font-medium text-white">
                            "{selectedPlaylist?.name}"
                        </span>
                        ?
                        <br />
                        <span className="text-red-400 text-sm">
                            This action cannot be undone.
                        </span>
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium flex-1 sm:flex-none"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 font-medium flex-1 sm:flex-none flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <FaTrash />
                                    Delete Playlist
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    // Loading skeleton component
    const PlaylistSkeleton = () => (
        <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-48 bg-gray-700 rounded-xl mb-4" />
            <div className="space-y-3">
                <div className="h-6 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
                <div className="flex gap-2 mt-4">
                    <div className="h-3 bg-gray-700 rounded w-16" />
                    <div className="h-3 bg-gray-700 rounded w-20" />
                </div>
                <div className="h-10 bg-gray-700 rounded mt-4" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
            <div className="max-w-7xl mx-auto p-4 sm:p-8">
                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-12"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            className="p-4 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl border border-purple-500/30"
                        >
                            <FaListUl className="text-3xl text-purple-400" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Your Playlists
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {loading ? (
                                    "Loading..."
                                ) : (
                                    <>
                                        {playlists.length}{" "}
                                        {playlists.length === 1
                                            ? "playlist"
                                            : "playlists"}
                                        {playlists.length > 0 && (
                                            <span className="ml-2">
                                                •{" "}
                                                {playlists.reduce(
                                                    (acc, p) =>
                                                        acc +
                                                        (p.videos?.length || 0),
                                                    0
                                                )}{" "}
                                                total videos
                                            </span>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 w-full sm:w-auto justify-center font-medium shadow-lg hover:shadow-purple-500/25"
                        aria-label="Create new playlist"
                    >
                        <FaPlus className="text-sm" />
                        New Playlist
                    </motion.button>
                </motion.div>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400"
                        >
                            <div className="flex items-center gap-2">
                                <FaExclamationTriangle />
                                <span>{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <PlaylistSkeleton key={`skeleton-${i}`} />
                        ))}
                    </div>
                ) : playlists.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 border-2 border-dashed border-gray-700 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mb-6"
                        >
                            <FaRegSadTear className="text-6xl mx-auto text-gray-600" />
                        </motion.div>
                        <h2 className="text-2xl mb-3 font-semibold">
                            No Playlists Found
                        </h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                            Start organizing your favorite content by creating
                            your first playlist. Group videos by theme, mood, or
                            any way you like!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-4 rounded-xl inline-flex items-center gap-3 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25"
                        >
                            <FaPlus />
                            Create Your First Playlist
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {playlists.map((playlist, index) => (
                                <motion.div
                                    key={playlist._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <PlaylistCard playlist={playlist} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {showCreateModal && <PlaylistForm isEdit={false} />}

                    {showEditModal && selectedPlaylist && (
                        <PlaylistForm isEdit={true} />
                    )}

                    {showDeleteModal && selectedPlaylist && <DeleteModal />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Playlist;