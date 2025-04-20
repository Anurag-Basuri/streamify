import { useState, useEffect } from "react";
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
    FaExclamationTriangle,
    FaTimes,
    FaSpinner,
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setformData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    // Fetch playlists with error handling
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
                setPlaylists(data.data || []);
            } catch (error) {
                console.error("Error fetching playlists:", error);
                toast.error(
                    error.response?.data?.message || "Failed to fetch playlists"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    // Reset form when modals close
    useEffect(() => {
        if (!showCreateModal && !showEditModal) {
            setformData({ name: "", description: "" });
        }
    }, [showCreateModal, showEditModal]);

    // Create Playlist
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        setProcessing(true);
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
        } catch (error) {
            console.error("Error creating playlist:", error);
            toast.error(
                error.response?.data?.message || "Failed to create playlist"
            );
        } finally {
            setProcessing(false);
        }
    };

    // Update Playlist
    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        if (!selectedPlaylist) return;
        setProcessing(true);
        try {
            console.log(formData);

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
            console.error("Error updating playlist:", error);
            toast.error(
                error.response?.data?.message || "Failed to update playlist"
            );
        } finally {
            setProcessing(false);
        }
    };

    // Delete Playlist
    const handleDeletePlaylist = async () => {
        if (!selectedPlaylist) return;
        setProcessing(true);
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
            console.error("Error deleting playlist:", error);
            toast.error(
                error.response?.data?.message || "Failed to delete playlist"
            );
        } finally {
            setProcessing(false);
        }
    };

    // Thumbnail Grid
    const ThumbnailGrid = ({ videos = [] }) => {
        const handleImageError = (e) => {
            e.target.src = "/fallback-thumbnail.jpg";
            e.target.onerror = null;
        };
    
        // Filter out any null/undefined videos and calculate count
        const validVideos = videos.filter(v => v?._id);
        const videoCount = validVideos.length;
    
        return (
            <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
                {videoCount > 0 ? (
                    <div className="grid grid-cols-2 gap-2 h-full">
                        {validVideos.slice(0, 4).map((video, index) => (
                            <div
                                key={`${video._id}-${index}`}
                                className="relative aspect-video"
                            >
                                <img
                                    src={video.thumbnail || "/fallback-thumbnail.jpg"}
                                    alt={`Thumbnail for ${video.title}`}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                                {index === 3 && videoCount > 4 && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xl font-medium">
                                        +{videoCount - 4}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                        <div className="relative w-20 h-20">
                            {/* Animated gradient circles */}
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-pulse" />
                            <div
                                className="absolute inset-2 bg-purple-500/30 rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                            />
                            <div
                                className="absolute inset-4 bg-purple-500/40 rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                            />
                            <FaFilm className="absolute inset-0 m-auto text-4xl text-purple-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Empty Playlist</p>
                            <p className="text-xs opacity-75">Add some videos to get started</p>
                        </div>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-gray-900/80 px-3 py-1 rounded-full text-sm font-medium">
                    {videoCount} {videoCount === 1 ? "video" : "videos"}
                </div>
            </div>
        );
    };
    
    // Thumbnail.propTypes
    ThumbnailGrid.propTypes = {
        videos: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                thumbnail: PropTypes.string,
                title: PropTypes.string,
            })
        ),
    };

    // Playlist Card
    const PlaylistCard = ({ playlist }) => {
        if (!playlist) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-300 group shadow-lg hover:shadow-xl"
            >
                <div
                    className="mb-4 cursor-pointer"
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    aria-label={`View ${playlist.name} playlist`}
                >
                    <ThumbnailGrid videos={playlist.videos || []} />
                </div>

                <div className="flex flex-col gap-3">
                    <h3
                        className="text-xl font-semibold truncate"
                        title={playlist.name}
                    >
                        {playlist.name}
                    </h3>
                    <p
                        className="text-gray-400 text-sm line-clamp-2 min-h-[3.5rem]"
                        title={playlist.description || "No description"}
                    >
                        {playlist.description || "No description provided"}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                        <button
                            onClick={() =>
                                navigate(`/playlist/${playlist._id}`)
                            }
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-200"
                            aria-label={`View ${playlist.name} playlist`}
                        >
                            View Playlist
                            <FiChevronRight className="mt-1" />
                        </button>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPlaylist(playlist);
                                    setformData({
                                        name: playlist.name,
                                        description: playlist.description || "",
                                    });
                                    setShowEditModal(true);
                                }}
                                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 p-2"
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
                                className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-2"
                                aria-label={`Delete ${playlist.name} playlist`}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // PlaylistCard.propTypes
    PlaylistCard.propTypes = {
        playlist: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            videos: PropTypes.arrayOf(
                PropTypes.shape({
                    _id: PropTypes.string,
                    thumbnail: PropTypes.string,
                    title: PropTypes.string,
                })
            ),
        }).isRequired,
    };

    // Modal
    const Modal = ({ title, children, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative shadow-2xl"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Close modal"
                >
                    <FaTimes className="text-xl" />
                </button>
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
                {children}
            </motion.div>
        </motion.div>
    );

    // Modal.propTypes
    Modal.propTypes = {
        title: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    // Playlist Form
    const PlaylistForm = () => {
        const [localFormData, setLocalFormData] = useState(formData);

        const handleSubmit = (e) => {
            e.preventDefault();
            setformData(localFormData);
            handleCreatePlaylist(e);
        };

        return (
            <Modal
                title="Create New Playlist"
                onClose={() => setShowCreateModal(false)}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            required
                            minLength={3}
                            maxLength={50}
                            className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none border border-gray-600 focus:border-transparent"
                            value={localFormData.name}
                            onChange={(e) =>
                                setLocalFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Title - My Awesome Playlist"
                        />
                    </div>
                    <div>
                        <textarea
                            maxLength={200}
                            className="w-full bg-gray-700 rounded-lg p-3 h-32 focus:ring-2 focus:ring-purple-500 outline-none border border-gray-600 focus:border-transparent"
                            value={localFormData.description}
                            onChange={(e) =>
                                setLocalFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Description - What's this playlist about?"
                        />
                    </div>
                    <div className="flex gap-4 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Playlist"
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    };

    // Edit Form
    const EditForm = () => {
        const [localFormData, setLocalFormData] = useState(formData);

        const handleSubmit = (e) => {
            e.preventDefault();
            setformData(localFormData);
            handleUpdatePlaylist(e);
        };

        return (
            <Modal
                title="Edit Playlist"
                onClose={() => setShowEditModal(false)}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Playlist Name *
                        </label>
                        <input
                            required
                            minLength={3}
                            maxLength={50}
                            className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none border border-gray-600 focus:border-transparent"
                            value={localFormData.name}
                            onChange={(e) =>
                                setLocalFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            maxLength={200}
                            className="w-full bg-gray-700 rounded-lg p-3 h-32 focus:ring-2 focus:ring-purple-500 outline-none border border-gray-600 focus:border-transparent"
                            value={localFormData.description}
                            onChange={(e) =>
                                setLocalFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="flex gap-4 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    };

    // Delete Modal
    const DeleteModal = () => (
        <Modal
            title="Confirm Deletion"
            onClose={() => setShowDeleteModal(false)}
        >
            <div className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="text-2xl text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Delete Playlist</h3>
                <p className="text-gray-400 mb-6">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-medium text-white">
                        {selectedPlaylist.name}
                    </span>
                    ?
                    <br />
                    This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium flex-1 sm:flex-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeletePlaylist}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 font-medium flex-1 sm:flex-none flex items-center justify-center gap-2"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Playlist"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600/20 rounded-lg">
                            <FaListUl className="text-3xl text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Your Playlists
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {playlists.length}{" "}
                                {playlists.length === 1
                                    ? "playlist"
                                    : "playlists"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 w-full sm:w-auto justify-center font-medium"
                        aria-label="Create new playlist"
                    >
                        <FaPlus /> New Playlist
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
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
                    <div className="text-center py-16 sm:py-20 border-2 border-dashed border-gray-700 rounded-xl">
                        <FaRegSadTear className="text-5xl sm:text-6xl mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl sm:text-2xl mb-2 font-semibold">
                            No Playlists Found
                        </h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">
                            Organize your favorite content by creating custom
                            playlists.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors duration-200"
                        >
                            <FaPlus /> Create Your First Playlist
                        </button>
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

                {/* Modals */}
                <AnimatePresence>
                    {showCreateModal && <PlaylistForm />}

                    {showEditModal && selectedPlaylist && <EditForm />}

                    {showDeleteModal && selectedPlaylist && <DeleteModal />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Playlist;