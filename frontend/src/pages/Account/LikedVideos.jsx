/**
 * Liked Videos Page
 * Display all videos the user has liked with grid/list view toggle
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHeart,
    FiGrid,
    FiList,
    FiRefreshCw,
    FiTrash2,
    FiPlay,
    FiClock,
    FiEye,
    FiMoreVertical,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { PageTransition, EmptyState } from "../../components/Common";
import { showError, showSuccess } from "../../components/Common/ToastProvider";
import { getLikedVideos, toggleVideoLike } from "../../services";
import { formatRelativeTime, formatCount } from "../../utils";

// ============================================================================
// VIDEO CARD FOR LIKED VIDEOS (with unlike action)
// ============================================================================

const LikedVideoCard = ({ video, onUnlike, viewMode = "grid" }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUnliking, setIsUnliking] = useState(false);

    const handleUnlike = async (e) => {
        e.stopPropagation();
        setIsUnliking(true);
        try {
            await onUnlike(video._id);
        } finally {
            setIsUnliking(false);
            setIsMenuOpen(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/video/${video._id}`);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // List view layout
    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleCardClick}
                className="flex gap-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)] cursor-pointer transition-all group"
            >
                {/* Thumbnail */}
                <div className="relative w-40 sm:w-48 flex-shrink-0 aspect-video rounded-lg overflow-hidden">
                    <img
                        src={video.thumbnail?.url || "/placeholder-video.jpg"}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-semibold bg-black/80 text-white rounded">
                        {formatDuration(video.duration)}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <FiPlay className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">
                            {video.title}
                        </h3>
                        <Link
                            to={`/channel/${video.owner?.userName}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
                        >
                            {video.owner?.fullName || video.owner?.userName}
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                            <FiEye size={12} />
                            {formatCount(video.views)} views
                        </span>
                        <span className="flex items-center gap-1">
                            <FiClock size={12} />
                            {formatRelativeTime(video.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handleUnlike}
                        disabled={isUnliking}
                        className="p-2 rounded-lg hover:bg-[var(--error-light)] text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors"
                        title="Unlike"
                    >
                        {isUnliking ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiTrash2 size={18} />
                        )}
                    </button>
                </div>
            </motion.div>
        );
    }

    // Grid view layout (default)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleCardClick}
            className="group cursor-pointer"
        >
            <div className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--brand-primary)] transition-all shadow-sm hover:shadow-lg">
                {/* Thumbnail */}
                <div className="relative aspect-video">
                    <img
                        src={video.thumbnail?.url || "/placeholder-video.jpg"}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-semibold bg-black/80 text-white rounded">
                        {formatDuration(video.duration)}
                    </span>

                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-[var(--brand-primary)]/80 rounded-full flex items-center justify-center">
                            <FiPlay className="w-5 h-5 text-white ml-0.5" />
                        </div>
                    </div>

                    {/* Unlike button (top right) */}
                    <div
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleUnlike}
                            disabled={isUnliking}
                            className="p-2 rounded-full bg-black/50 hover:bg-[var(--error)] text-white transition-colors"
                            title="Unlike"
                        >
                            {isUnliking ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiHeart className="w-4 h-4 fill-current" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] line-clamp-2 mb-2">
                        {video.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                        {video.owner?.avatar ? (
                            <img
                                src={video.owner.avatar}
                                alt={video.owner.userName}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    {video.owner?.userName
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </span>
                            </div>
                        )}
                        <Link
                            to={`/channel/${video.owner?.userName}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] truncate"
                        >
                            {video.owner?.fullName || video.owner?.userName}
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <span>{formatCount(video.views)} views</span>
                        <span>•</span>
                        <span>{formatRelativeTime(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const LikedVideoSkeleton = ({ viewMode = "grid" }) => {
    if (viewMode === "list") {
        return (
            <div className="flex gap-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                <div className="w-40 sm:w-48 aspect-video skeleton rounded-lg" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                    <div className="h-3 skeleton rounded w-1/4 mt-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border-light)]">
            <div className="aspect-video skeleton" />
            <div className="p-3 sm:p-4 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 skeleton rounded-full" />
                    <div className="h-3 skeleton rounded w-1/3" />
                </div>
                <div className="h-3 skeleton rounded w-1/2" />
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LikedVideos = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState("grid");

    const fetchLikedVideos = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const data = await getLikedVideos({ page: 1, limit: 50 });
            // Handle different response structures
            const videoList = Array.isArray(data)
                ? data
                : data.docs || data.videos || [];
            setVideos(videoList);
        } catch (error) {
            console.error("Failed to load liked videos:", error);
            showError("Failed to load liked videos");
            setVideos([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth?redirect=/liked");
            return;
        }
        fetchLikedVideos();
    }, [isAuthenticated, navigate, fetchLikedVideos]);

    const handleUnlike = async (videoId) => {
        try {
            await toggleVideoLike(videoId);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            showSuccess("Video removed from liked");
        } catch (error) {
            showError("Failed to unlike video");
            throw error;
        }
    };

    const handleRefresh = () => {
        fetchLikedVideos(true);
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <FiHeart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                Liked Videos
                            </h1>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                {loading
                                    ? "Loading..."
                                    : `${videos.length} ${
                                          videos.length === 1
                                              ? "video"
                                              : "videos"
                                      }`}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Refresh"
                        >
                            <FiRefreshCw
                                size={20}
                                className={refreshing ? "animate-spin" : ""}
                            />
                        </button>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                }`}
                                title="Grid view"
                            >
                                <FiGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === "list"
                                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                }`}
                                title="List view"
                            >
                                <FiList size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                                : "space-y-3"
                        }
                    >
                        {Array.from({ length: 8 }).map((_, i) => (
                            <LikedVideoSkeleton key={i} viewMode={viewMode} />
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <EmptyState
                            preset="noLikedVideos"
                            actionLabel="Browse Videos"
                            action={() => navigate("/")}
                        />
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                                    : "space-y-3"
                            }
                        >
                            {videos.map((video, index) => (
                                <LikedVideoCard
                                    key={video._id}
                                    video={video}
                                    onUnlike={handleUnlike}
                                    viewMode={viewMode}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </PageTransition>
    );
};

export default LikedVideos;
