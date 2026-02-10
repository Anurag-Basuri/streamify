/**
 * Playlist Page
 * Full CRUD for user playlists with theme-aware styling
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiFilm,
    FiList,
    FiX,
    FiPlay,
    FiClock,
    FiChevronRight,
    FiCalendar,
    FiAlertCircle,
} from "react-icons/fi";
import usePlaylist from "../../hooks/usePlaylist";
import useAuth from "../../hooks/useAuth";
import { PageTransition } from "../../components/Common";
import { showSuccess, showError } from "../../components/Common/ToastProvider";

// ============================================================================
// THUMBNAIL GRID
// ============================================================================

const ThumbnailGrid = ({ videos = [] }) => {
    const validVideos = (videos || []).filter((v) => v && v._id);
    const videoCount = validVideos.length;

    const handleImageError = (e) => {
        e.target.src = "/fallback-thumbnail.jpg";
        e.target.onerror = null;
    };

    return (
        <div className="relative h-40 rounded-xl overflow-hidden bg-[var(--bg-tertiary)]">
            {videoCount > 0 ? (
                <div className="grid grid-cols-2 gap-0.5 h-full">
                    {validVideos.slice(0, 4).map((video, index) => (
                        <div
                            key={`${video._id}-${index}`}
                            className="relative overflow-hidden"
                        >
                            <img
                                src={
                                    video.thumbnail || "/fallback-thumbnail.jpg"
                                }
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                loading="lazy"
                            />
                            {index === 3 && videoCount > 4 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold">
                                    +{videoCount - 4}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                    <FiFilm size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No videos</p>
                </div>
            )}
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
                {videoCount} {videoCount === 1 ? "video" : "videos"}
            </div>
        </div>
    );
};

// ============================================================================
// PLAYLIST CARD
// ============================================================================

const PlaylistCard = ({ playlist, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const videoCount = playlist.videos?.length || 0;

    const totalSeconds = (playlist.videos || []).reduce((acc, video) => {
        if (video && typeof video.duration === "number")
            return acc + video.duration;
        return acc;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] overflow-hidden hover:border-[var(--brand-primary)]/50 transition-all group"
        >
            {/* Thumbnail */}
            <div
                className="cursor-pointer relative"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
            >
                <ThumbnailGrid videos={playlist.videos || []} />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
                        <FiPlay size={20} className="text-white ml-1" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                        className="font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors"
                        title={playlist.name}
                    >
                        {playlist.name}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(playlist);
                            }}
                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            <FiEdit2 size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(playlist);
                            }}
                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                </div>

                <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 mb-3 min-h-[2.5rem]">
                    {playlist.description || "No description"}
                </p>

                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                        <FiClock size={12} />
                        {duration}
                    </span>
                    {playlist.createdAt && (
                        <span className="flex items-center gap-1">
                            <FiCalendar size={12} />
                            {formatDate(playlist.createdAt)}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="w-full mt-3 flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--brand-primary)]/10 border border-[var(--border-light)] hover:border-[var(--brand-primary)]/30 transition-all"
                >
                    <span className="text-sm font-medium text-[var(--brand-primary)]">
                        View Playlist
                    </span>
                    <div className="flex items-center gap-1 text-[var(--brand-primary)]">
                        <span className="text-xs">{videoCount} videos</span>
                        <FiChevronRight size={14} />
                    </div>
                </button>
            </div>
        </motion.div>
    );
};

// ============================================================================
// MODAL
// ============================================================================

const Modal = ({ title, children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[var(--bg-elevated)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-light)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                    <FiX size={20} />
                </button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

// ============================================================================
// PLAYLIST FORM
// ============================================================================

const PlaylistForm = ({ isEdit, initialData, onSubmit, onClose, loading }) => {
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(
        initialData?.description || ""
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            showError("Playlist name is required");
            return;
        }
        onSubmit({ name: name.trim(), description: description.trim() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Playlist Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    placeholder="My Awesome Playlist"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="What's this playlist about?"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {description.length}/500
                </p>
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-medium hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors"
                >
                    {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                </button>
            </div>
        </form>
    );
};

// ============================================================================
// DELETE CONFIRMATION
// ============================================================================

const DeleteConfirmation = ({ playlist, onConfirm, onClose, loading }) => (
    <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
            <FiAlertCircle size={28} className="text-[var(--error)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Delete Playlist?
        </h3>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">
            Are you sure you want to delete "{playlist?.name}"?
            <br />
            <span className="text-[var(--error)]">
                This action cannot be undone.
            </span>
        </p>
        <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--error)] text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
                {loading ? "Deleting..." : "Delete"}
            </button>
        </div>
    </div>
);

// ============================================================================
// SKELETON
// ============================================================================

const PlaylistSkeleton = () => (
    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] overflow-hidden animate-pulse">
        <div className="h-40 bg-[var(--bg-tertiary)]" />
        <div className="p-4 space-y-3">
            <div className="h-5 bg-[var(--bg-tertiary)] rounded w-3/4" />
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full" />
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3" />
            <div className="h-10 bg-[var(--bg-tertiary)] rounded mt-3" />
        </div>
    </div>
);

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = ({ onCreateClick }) => (
    <div className="text-center py-16 px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
            <FiList size={36} className="text-[var(--text-tertiary)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No Playlists Yet
        </h2>
        <p className="text-[var(--text-tertiary)] mb-6 max-w-sm mx-auto">
            Create your first playlist to organize your favorite videos
        </p>
        <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
        >
            <FiPlus size={18} />
            Create Playlist
        </button>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Playlist = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        playlists,
        loading,
        error,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        fetchUserPlaylists,
    } = usePlaylist(null, user);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUserPlaylists();
    }, [fetchUserPlaylists]);

    const handleCreate = async (data) => {
        setActionLoading(true);
        const success = await createPlaylist(data);
        setActionLoading(false);
        if (success) {
            setShowCreateModal(false);
            showSuccess("Playlist created!");
        }
    };

    const handleUpdate = async (data) => {
        if (!selectedPlaylist) return;
        setActionLoading(true);
        const success = await updatePlaylist(selectedPlaylist._id, data);
        setActionLoading(false);
        if (success) {
            setShowEditModal(false);
            setSelectedPlaylist(null);
            showSuccess("Playlist updated!");
        }
    };

    const handleDelete = async () => {
        if (!selectedPlaylist) return;
        setActionLoading(true);
        const success = await deletePlaylist(selectedPlaylist._id);
        setActionLoading(false);
        if (success) {
            setShowDeleteModal(false);
            setSelectedPlaylist(null);
            showSuccess("Playlist deleted!");
        }
    };

    const openEdit = (playlist) => {
        setSelectedPlaylist(playlist);
        setShowEditModal(true);
    };

    const openDelete = (playlist) => {
        setSelectedPlaylist(playlist);
        setShowDeleteModal(true);
    };

    const totalVideos = playlists.reduce(
        (acc, p) => acc + (p.videos?.length || 0),
        0
    );

    return (
        <PageTransition className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-purple-600 flex items-center justify-center">
                            <FiList size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                Your Playlists
                            </h1>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                {loading
                                    ? "Loading..."
                                    : `${playlists.length} playlists • ${totalVideos} videos`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
                    >
                        <FiPlus size={18} />
                        New Playlist
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)]">
                        {error}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <PlaylistSkeleton key={i} />
                        ))}
                    </div>
                ) : playlists.length === 0 ? (
                    <EmptyState
                        onCreateClick={() => setShowCreateModal(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {playlists.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {showCreateModal && (
                        <Modal
                            title="Create Playlist"
                            onClose={() => setShowCreateModal(false)}
                        >
                            <PlaylistForm
                                isEdit={false}
                                onSubmit={handleCreate}
                                onClose={() => setShowCreateModal(false)}
                                loading={actionLoading}
                            />
                        </Modal>
                    )}

                    {showEditModal && selectedPlaylist && (
                        <Modal
                            title="Edit Playlist"
                            onClose={() => setShowEditModal(false)}
                        >
                            <PlaylistForm
                                isEdit={true}
                                initialData={selectedPlaylist}
                                onSubmit={handleUpdate}
                                onClose={() => setShowEditModal(false)}
                                loading={actionLoading}
                            />
                        </Modal>
                    )}

                    {showDeleteModal && selectedPlaylist && (
                        <Modal
                            title=""
                            onClose={() => setShowDeleteModal(false)}
                        >
                            <DeleteConfirmation
                                playlist={selectedPlaylist}
                                onConfirm={handleDelete}
                                onClose={() => setShowDeleteModal(false)}
                                loading={actionLoading}
                            />
                        </Modal>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default Playlist;
