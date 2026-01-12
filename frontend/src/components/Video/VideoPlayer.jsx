import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import {
    FaSpinner,
    FaHeart,
    FaRegHeart,
    FaComment,
    FaPlus,
    FaDownload,
    FaShare,
    FaExclamationTriangle,
    FaArrowLeft,
    FaExpand,
    FaCompress,
    FaBookmark,
    FaRegBookmark,
    FaChevronDown,
    FaChevronUp,
    FaUserPlus,
    FaCheck,
    FaTimes,
    FaPlay,
    FaVolumeUp,
    FaVolumeMute,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TimeAgo from "timeago-react";

// Hooks and services
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import useVideoPlayer from "../../hooks/useVideoPlayer";
import { api } from "../../services/api";
import {
    checkSubscription as checkSub,
    toggleSubscription,
} from "../../services";
import { showSuccess, showError, showInfo } from "../Common/ToastProvider";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toLocaleString();
};

// ============================================================================
// CUSTOM HOOK: useMediaQuery
// ============================================================================

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== "undefined") {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, [query]);

    return matches;
};

// ============================================================================
// LOADING SKELETON - Responsive
// ============================================================================

const VideoSkeleton = () => {
    const isMobile = useMediaQuery("(max-width: 640px)");

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <div className="animate-pulse">
                {/* Video skeleton - full width on mobile */}
                <div
                    className={`${
                        isMobile
                            ? ""
                            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
                    }`}
                >
                    <div
                        className={`aspect-video bg-[var(--bg-tertiary)] ${
                            isMobile ? "" : "rounded-2xl"
                        }`}
                    />
                </div>

                {/* Action bar skeleton */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-10 w-20 sm:w-24 bg-[var(--bg-tertiary)] rounded-full flex-shrink-0"
                            />
                        ))}
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-7 sm:h-8 bg-[var(--bg-tertiary)] rounded-lg w-full sm:w-3/4" />
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--bg-tertiary)] rounded-full" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24 sm:w-32" />
                                        <div className="h-3 bg-[var(--bg-tertiary)] rounded w-16 sm:w-24" />
                                    </div>
                                </div>
                                <div className="h-10 w-24 sm:w-28 bg-[var(--bg-tertiary)] rounded-full" />
                            </div>
                            <div className="h-28 sm:h-32 bg-[var(--bg-tertiary)] rounded-xl" />
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 space-y-4">
                                <div className="h-6 bg-[var(--bg-tertiary)] rounded w-32" />
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full flex-shrink-0" />
                                        <div className="flex-1 h-16 bg-[var(--bg-tertiary)] rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ERROR STATE
// ============================================================================

const ErrorState = ({ error, onRetry, onGoBack }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-elevated)] p-6 sm:p-8 rounded-2xl shadow-xl text-center max-w-sm sm:max-w-md w-full border border-[var(--border-light)]"
        >
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <FaExclamationTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                Failed to Load Video
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 line-clamp-3">
                {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onGoBack}
                    className="px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <FaArrowLeft size={14} />
                    Go Back
                </button>
                <button
                    onClick={onRetry}
                    className="px-4 py-2.5 bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-primary-hover)] active:scale-95 transition-all font-medium"
                >
                    Try Again
                </button>
            </div>
        </motion.div>
    </div>
);

// ============================================================================
// NOT FOUND STATE
// ============================================================================

const NotFoundState = ({ onGoHome }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-elevated)] p-6 sm:p-8 rounded-2xl shadow-xl text-center max-w-sm sm:max-w-md w-full border border-[var(--border-light)]"
        >
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                <FaPlay className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--text-tertiary)] ml-1" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                Video Not Found
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6">
                This video may have been removed or is no longer available.
            </p>
            <button
                onClick={onGoHome}
                className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-primary-hover)] active:scale-95 transition-all font-medium"
            >
                Browse Videos
            </button>
        </motion.div>
    </div>
);

// ============================================================================
// ACTION BUTTON - Improved touch targets
// ============================================================================

const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    active,
    disabled,
    loading,
    count,
}) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
            flex items-center justify-center gap-1.5 sm:gap-2 
            px-3 sm:px-4 py-2 sm:py-2.5 
            rounded-full font-medium text-xs sm:text-sm
            transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[40px] min-w-[40px]
            touch-manipulation
            ${
                active
                    ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/25"
                    : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)]"
            }
        `}
    >
        {loading ? (
            <FaSpinner className="animate-spin" size={14} />
        ) : (
            <Icon size={14} className={active ? "text-white" : ""} />
        )}
        {(label || count !== undefined) && (
            <span className={count !== undefined ? "" : "hidden sm:inline"}>
                {count !== undefined ? formatViews(count) : label}
            </span>
        )}
    </motion.button>
);

// ============================================================================
// COMMENT ITEM - Improved mobile layout
// ============================================================================

const CommentItem = ({
    comment,
    onLike,
    isLiking,
    isAuthenticated,
    onLoginPrompt,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
        className="flex gap-2.5 sm:gap-3"
    >
        <Link to={`/profile/${comment.owner?._id}`} className="flex-shrink-0">
            <img
                src={comment.owner?.avatar || "/default-avatar.png"}
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-transparent hover:ring-[var(--brand-primary)] transition-all"
                loading="lazy"
            />
        </Link>
        <div className="flex-1 min-w-0 bg-[var(--bg-primary)] p-3 sm:p-4 rounded-2xl">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <Link
                            to={`/profile/${comment.owner?._id}`}
                            className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors truncate"
                        >
                            {comment.owner?.userName || "Anonymous"}
                        </Link>
                        <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">
                            <TimeAgo datetime={comment.createdAt} />
                        </span>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                        isAuthenticated ? onLike(comment._id) : onLoginPrompt()
                    }
                    disabled={isLiking}
                    className={`
                        flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        transition-all duration-200 disabled:opacity-50 flex-shrink-0
                        min-h-[28px] touch-manipulation
                        ${
                            comment.isLiked
                                ? "bg-red-500/10 text-red-500"
                                : "text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--brand-primary)]"
                        }
                    `}
                >
                    {isLiking ? (
                        <FaSpinner className="animate-spin" size={10} />
                    ) : comment.isLiked ? (
                        <FaHeart size={10} />
                    ) : (
                        <FaRegHeart size={10} />
                    )}
                    <span>{comment.likesCount || 0}</span>
                </motion.button>
            </div>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mt-1.5 sm:mt-2 whitespace-pre-wrap break-words">
                {comment.content}
            </p>
        </div>
    </motion.div>
);

// ============================================================================
// DESCRIPTION BOX - Improved readability
// ============================================================================

const DescriptionBox = ({ description, views, createdAt }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = description?.length > 150;

    return (
        <motion.div
            layout
            className="bg-[var(--bg-secondary)] p-3 sm:p-4 rounded-xl sm:rounded-2xl"
        >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                <span>{formatViews(views)} views</span>
                <span className="text-[var(--text-tertiary)]">•</span>
                <TimeAgo
                    datetime={createdAt}
                    className="text-[var(--text-tertiary)]"
                />
            </div>
            <motion.div layout className="overflow-hidden">
                <p
                    className={`text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap ${
                        !expanded && isLong
                            ? "line-clamp-2 sm:line-clamp-3"
                            : ""
                    }`}
                >
                    {description || "No description provided."}
                </p>
            </motion.div>
            {isLong && (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] flex items-center gap-1 transition-colors touch-manipulation"
                >
                    {expanded ? (
                        <>
                            Show less <FaChevronUp size={10} />
                        </>
                    ) : (
                        <>
                            Show more <FaChevronDown size={10} />
                        </>
                    )}
                </motion.button>
            )}
        </motion.div>
    );
};

// ============================================================================
// PLAYLIST MODAL - Mobile optimized
// ============================================================================

const PlaylistModal = ({ isOpen, onClose, playlists, onAddToPlaylist }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-[var(--bg-elevated)] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[80vh] border-t sm:border border-[var(--border-light)] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drag handle for mobile */}
                    <div className="w-10 h-1 bg-[var(--text-tertiary)]/30 rounded-full mx-auto mb-4 sm:hidden" />

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                            Save to Playlist
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-secondary)] touch-manipulation"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto overscroll-contain">
                        {playlists.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                    <FaPlus className="w-6 h-6 text-[var(--text-tertiary)]" />
                                </div>
                                <p className="text-[var(--text-secondary)] font-medium">
                                    No playlists yet
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    Create one to save videos
                                </p>
                            </div>
                        ) : (
                            playlists.map((playlist) => (
                                <motion.button
                                    key={playlist._id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        onAddToPlaylist(playlist._id)
                                    }
                                    className="w-full p-3 text-left hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)] rounded-xl flex items-center gap-3 transition-colors touch-manipulation"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <FaPlus
                                            className="text-[var(--brand-primary)]"
                                            size={14}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--text-primary)] truncate">
                                            {playlist.name}
                                        </p>
                                        <p className="text-xs text-[var(--text-tertiary)]">
                                            {playlist.videos?.length || 0}{" "}
                                            videos
                                        </p>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VideoPlayer = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    // Responsive hooks
    const isMobile = useMediaQuery("(max-width: 640px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");

    // Auth state
    const { isAuthenticated, user, authLoading } = useAuth();

    // Video player hook
    const {
        video,
        videoLoading,
        videoError,
        fetchVideo,
        handleVideoPlay,
        likeState,
        isLiking,
        handleLike,
        comments,
        commentsLoading,
        commentsPagination,
        loadMoreComments,
        addComment,
        handleCommentLike,
    } = useVideoPlayer(videoID, isAuthenticated);

    // Watch later
    const {
        isInWatchLater,
        addToWatchLater,
        removeFromWatchLater,
        fetchWatchLater,
        loading: watchLaterLoading,
    } = useWatchLater(isAuthenticated ? user : null);

    // Local state
    const [newComment, setNewComment] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentLikeLoading, setCommentLikeLoading] = useState({});
    const [showPlaylists, setShowPlaylists] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [theaterMode, setTheaterMode] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [showMobileComments, setShowMobileComments] = useState(false);

    // Memoized values
    const isVideoInWatchLater = useMemo(
        () => (video?._id ? isInWatchLater(video._id) : false),
        [video?._id, isInWatchLater]
    );

    // Fetch playlists
    const fetchPlaylists = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get("/api/v1/playlists/");
            setPlaylists(data.data.playlists || []);
        } catch (err) {
            console.error("Failed to fetch playlists:", err);
        }
    }, [isAuthenticated]);

    // Check subscription status
    const checkSubscriptionStatus = useCallback(async () => {
        if (!isAuthenticated || !video?.owner?._id) return;
        try {
            const result = await checkSub(video.owner._id);
            setIsSubscribed(result?.isSubscribed || false);
        } catch (err) {
            console.error("Failed to check subscription:", err);
        }
    }, [isAuthenticated, video?.owner?._id]);

    // Effects
    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchLater().catch(console.error);
            fetchPlaylists();
        }
    }, [isAuthenticated, fetchWatchLater, fetchPlaylists]);

    useEffect(() => {
        checkSubscriptionStatus();
    }, [checkSubscriptionStatus]);

    // Keyboard shortcuts (disabled on mobile)
    useEffect(() => {
        if (isMobile) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
                return;

            switch (e.key.toLowerCase()) {
                case "t":
                    setTheaterMode((prev) => !prev);
                    break;
                case "f":
                    if (playerContainerRef.current) {
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        } else {
                            playerContainerRef.current.requestFullscreen();
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobile]);

    // Handlers
    const handleVideoLike = async () => {
        if (!isAuthenticated) {
            showInfo("Login to like videos");
            navigate("/auth");
            return;
        }
        try {
            await handleLike();
        } catch (err) {
            showError(err.message || "Like action failed");
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            showInfo("Login to subscribe");
            navigate("/auth");
            return;
        }
        if (!video?.owner?._id || subscribing) return;

        try {
            setSubscribing(true);
            const result = await toggleSubscription(video.owner._id);
            setIsSubscribed(result?.subscribed ?? !isSubscribed);
            showSuccess(isSubscribed ? "Unsubscribed" : "Subscribed!");
        } catch (err) {
            showError(err.message || "Subscription failed");
        } finally {
            setSubscribing(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showInfo("Login to comment");
            navigate("/auth");
            return;
        }
        if (!newComment.trim() || commentSubmitting) return;

        try {
            setCommentSubmitting(true);
            await addComment(newComment);
            setNewComment("");
            showSuccess("Comment added!");
        } catch (err) {
            showError(err.message || "Failed to add comment");
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleCommentLikeClick = async (commentId) => {
        if (commentLikeLoading[commentId]) return;
        try {
            setCommentLikeLoading((prev) => ({ ...prev, [commentId]: true }));
            await handleCommentLike(commentId);
        } catch (err) {
            showError(err.message || "Failed to like comment");
        } finally {
            setCommentLikeLoading((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: video?.title || "Check out this video",
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                showSuccess("Link copied!");
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                await navigator.clipboard.writeText(url);
                showSuccess("Link copied!");
            }
        }
    }, [video]);

    const handleWatchLater = async () => {
        if (!isAuthenticated) {
            showInfo("Login to save");
            navigate("/auth");
            return;
        }
        if (!video?._id) return;

        try {
            if (isVideoInWatchLater) {
                await removeFromWatchLater(video._id);
                showSuccess("Removed from Watch Later");
            } else {
                await addToWatchLater(video._id);
                showSuccess("Added to Watch Later");
            }
        } catch (err) {
            showError("Failed to update");
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        try {
            await api.post(
                `/api/v1/playlists/${playlistId}/videos/${video._id}`
            );
            showSuccess("Added to playlist!");
            setShowPlaylists(false);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to add");
        }
    };

    const handleLoginPrompt = () => {
        showInfo("Login to interact");
        navigate("/auth");
    };

    // Loading state
    if (authLoading || videoLoading) {
        return <VideoSkeleton />;
    }

    // Error state
    if (videoError) {
        return (
            <ErrorState
                error={videoError}
                onRetry={fetchVideo}
                onGoBack={() => navigate(-1)}
            />
        );
    }

    // Not found state
    if (!video) {
        return <NotFoundState onGoHome={() => navigate("/")} />;
    }

    // Disable theater mode on mobile
    const effectiveTheaterMode = theaterMode && !isMobile;

    return (
        <div
            className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] ${
                effectiveTheaterMode ? "" : ""
            }`}
        >
            {/* Video Player Section */}
            <div
                className={`${
                    effectiveTheaterMode
                        ? ""
                        : isMobile
                        ? ""
                        : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
                }`}
            >
                <div
                    ref={playerContainerRef}
                    className={`
                        relative bg-black overflow-hidden
                        ${
                            effectiveTheaterMode
                                ? "aspect-[21/9] shadow-2xl"
                                : isMobile
                                ? "aspect-video"
                                : "aspect-video rounded-2xl shadow-2xl"
                        }
                    `}
                >
                    <ReactPlayer
                        ref={playerRef}
                        key={videoID}
                        url={video.videoFile?.url}
                        controls
                        width="100%"
                        height="100%"
                        onPlay={handleVideoPlay}
                        playsinline
                        config={{
                            file: {
                                attributes: {
                                    controlsList: "nodownload",
                                    playsInline: true,
                                },
                            },
                        }}
                        className="react-player"
                    />

                    {/* Theater Mode Toggle - Desktop only */}
                    {!isMobile && (
                        <button
                            onClick={() => setTheaterMode(!theaterMode)}
                            className="absolute bottom-16 right-4 p-2.5 rounded-lg backdrop-blur-md bg-black/60 text-white hover:bg-black/80 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
                            title={
                                theaterMode
                                    ? "Exit theater (T)"
                                    : "Theater mode (T)"
                            }
                        >
                            {theaterMode ? (
                                <FaCompress size={16} />
                            ) : (
                                <FaExpand size={16} />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div
                className={`${
                    effectiveTheaterMode
                        ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                        : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
                } mt-3 sm:mt-4`}
            >
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    <ActionButton
                        icon={likeState.isLiked ? FaHeart : FaRegHeart}
                        count={likeState.likesCount}
                        onClick={handleVideoLike}
                        active={likeState.isLiked}
                        loading={isLiking}
                    />
                    <ActionButton
                        icon={FaShare}
                        label="Share"
                        onClick={handleShare}
                    />
                    <ActionButton
                        icon={isVideoInWatchLater ? FaBookmark : FaRegBookmark}
                        label={
                            isMobile
                                ? ""
                                : isVideoInWatchLater
                                ? "Saved"
                                : "Save"
                        }
                        onClick={handleWatchLater}
                        active={isVideoInWatchLater}
                        loading={watchLaterLoading}
                    />
                    <ActionButton
                        icon={FaPlus}
                        label={isMobile ? "" : "Playlist"}
                        onClick={() => {
                            if (!isAuthenticated) {
                                handleLoginPrompt();
                                return;
                            }
                            setShowPlaylists(true);
                        }}
                    />
                    <a
                        href={video.videoFile?.url}
                        download
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)] transition-all min-h-[40px] touch-manipulation flex-shrink-0"
                    >
                        <FaDownload size={14} />
                        <span className="hidden sm:inline">Download</span>
                    </a>

                    {/* Mobile comments button */}
                    {isMobile && (
                        <ActionButton
                            icon={FaComment}
                            count={comments.length}
                            onClick={() => setShowMobileComments(true)}
                        />
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div
                className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6 pb-6 sm:pb-8`}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                        {/* Title */}
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text-primary)] leading-snug">
                            {video.title}
                        </h1>

                        {/* Channel Info & Subscribe */}
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                to={`/profile/${video.owner?._id}`}
                                className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1"
                            >
                                <img
                                    src={
                                        video.owner?.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt=""
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full ring-2 ring-transparent hover:ring-[var(--brand-primary)] object-cover transition-all flex-shrink-0"
                                    loading="lazy"
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm sm:text-base text-[var(--text-primary)] truncate">
                                        {video.owner?.userName || "Unknown"}
                                    </p>
                                    <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
                                        {formatViews(
                                            video.owner?.subscribersCount
                                        )}{" "}
                                        subscribers
                                    </p>
                                </div>
                            </Link>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className={`
                                    flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 
                                    rounded-full font-semibold text-xs sm:text-sm
                                    transition-all duration-200 disabled:opacity-50
                                    flex-shrink-0 min-h-[40px] touch-manipulation
                                    ${
                                        isSubscribed
                                            ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                            : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] shadow-lg shadow-[var(--brand-primary)]/25"
                                    }
                                `}
                            >
                                {subscribing ? (
                                    <FaSpinner
                                        className="animate-spin"
                                        size={14}
                                    />
                                ) : isSubscribed ? (
                                    <>
                                        <FaCheck size={12} />
                                        <span className="hidden xs:inline">
                                            Subscribed
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus size={12} />
                                        <span>Subscribe</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Description */}
                        <DescriptionBox
                            description={video.description}
                            views={video.views}
                            createdAt={video.createdAt}
                        />

                        {/* Tags */}
                        {video.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {video.tags
                                    .slice(0, isMobile ? 5 : 10)
                                    .map((tag, index) => (
                                        <Link
                                            key={`${tag}-${index}`}
                                            to={`/search?q=${encodeURIComponent(
                                                tag
                                            )}`}
                                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full hover:bg-[var(--brand-primary)] hover:text-white active:scale-95 transition-all font-medium"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                {video.tags.length > (isMobile ? 5 : 10) && (
                                    <span className="px-2.5 py-1 text-xs text-[var(--text-tertiary)]">
                                        +
                                        {video.tags.length -
                                            (isMobile ? 5 : 10)}{" "}
                                        more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Comments Section - Desktop */}
                    {!isMobile && (
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-20">
                                <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 sm:p-5">
                                    <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                                        <FaComment className="text-[var(--brand-primary)]" />
                                        {comments.length} Comments
                                    </h3>

                                    {/* Comment Input */}
                                    {isAuthenticated ? (
                                        <form
                                            onSubmit={handleCommentSubmit}
                                            className="mb-4 sm:mb-5"
                                        >
                                            <div className="flex gap-2.5 sm:gap-3">
                                                <img
                                                    src={
                                                        user?.avatar ||
                                                        "/default-avatar.png"
                                                    }
                                                    alt=""
                                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) =>
                                                            setNewComment(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Add a comment..."
                                                        rows={2}
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none placeholder-[var(--text-tertiary)] text-[var(--text-primary)] transition-all resize-none text-sm"
                                                        disabled={
                                                            commentSubmitting
                                                        }
                                                        maxLength={500}
                                                    />
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-[var(--text-tertiary)]">
                                                            {newComment.length}
                                                            /500
                                                        </span>
                                                        <motion.button
                                                            whileTap={{
                                                                scale: 0.95,
                                                            }}
                                                            type="submit"
                                                            disabled={
                                                                !newComment.trim() ||
                                                                commentSubmitting
                                                            }
                                                            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                                        >
                                                            {commentSubmitting && (
                                                                <FaSpinner
                                                                    className="animate-spin"
                                                                    size={12}
                                                                />
                                                            )}
                                                            Post
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-[var(--bg-primary)] rounded-xl text-center">
                                            <button
                                                onClick={() =>
                                                    navigate("/auth")
                                                }
                                                className="text-[var(--brand-primary)] hover:underline font-semibold text-sm"
                                            >
                                                Login
                                            </button>{" "}
                                            <span className="text-[var(--text-secondary)] text-sm">
                                                to comment
                                            </span>
                                        </div>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-3 sm:space-y-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin overscroll-contain">
                                        {commentsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <FaSpinner className="animate-spin text-xl text-[var(--brand-primary)]" />
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                                                    <FaComment className="w-6 h-6 text-[var(--text-tertiary)]" />
                                                </div>
                                                <p className="text-[var(--text-secondary)] font-medium">
                                                    No comments yet
                                                </p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    Be the first!
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <AnimatePresence mode="popLayout">
                                                    {comments.map((comment) => (
                                                        <CommentItem
                                                            key={comment._id}
                                                            comment={comment}
                                                            onLike={
                                                                handleCommentLikeClick
                                                            }
                                                            isLiking={
                                                                commentLikeLoading[
                                                                    comment._id
                                                                ]
                                                            }
                                                            isAuthenticated={
                                                                isAuthenticated
                                                            }
                                                            onLoginPrompt={
                                                                handleLoginPrompt
                                                            }
                                                        />
                                                    ))}
                                                </AnimatePresence>

                                                {commentsPagination?.hasMore && (
                                                    <motion.button
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                        onClick={
                                                            loadMoreComments
                                                        }
                                                        className="w-full py-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors"
                                                    >
                                                        Load more
                                                    </motion.button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Comments Sheet */}
            <AnimatePresence>
                {showMobileComments && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50"
                        onClick={() => setShowMobileComments(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            className="absolute bottom-0 left-0 right-0 bg-[var(--bg-elevated)] rounded-t-3xl max-h-[85vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drag handle */}
                            <div className="sticky top-0 bg-[var(--bg-elevated)] pt-3 pb-2 px-4 border-b border-[var(--border-light)]">
                                <div className="w-10 h-1 bg-[var(--text-tertiary)]/30 rounded-full mx-auto mb-3" />
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <FaComment className="text-[var(--brand-primary)]" />
                                        {comments.length} Comments
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowMobileComments(false)
                                        }
                                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-full"
                                    >
                                        <FaTimes size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(85vh-80px)] overscroll-contain">
                                <div className="p-4 space-y-4">
                                    {/* Comment Input */}
                                    {isAuthenticated ? (
                                        <form
                                            onSubmit={handleCommentSubmit}
                                            className="pb-4 border-b border-[var(--border-light)]"
                                        >
                                            <div className="flex gap-2.5">
                                                <img
                                                    src={
                                                        user?.avatar ||
                                                        "/default-avatar.png"
                                                    }
                                                    alt=""
                                                    className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) =>
                                                            setNewComment(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Add a comment..."
                                                        rows={2}
                                                        className="w-full bg-[var(--bg-secondary)] border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none placeholder-[var(--text-tertiary)] text-[var(--text-primary)] resize-none text-sm"
                                                        disabled={
                                                            commentSubmitting
                                                        }
                                                        maxLength={500}
                                                    />
                                                    <div className="flex justify-end">
                                                        <motion.button
                                                            whileTap={{
                                                                scale: 0.95,
                                                            }}
                                                            type="submit"
                                                            disabled={
                                                                !newComment.trim() ||
                                                                commentSubmitting
                                                            }
                                                            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-full text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {commentSubmitting && (
                                                                <FaSpinner
                                                                    className="animate-spin"
                                                                    size={12}
                                                                />
                                                            )}
                                                            Post
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center">
                                            <button
                                                onClick={() => {
                                                    setShowMobileComments(
                                                        false
                                                    );
                                                    navigate("/auth");
                                                }}
                                                className="text-[var(--brand-primary)] font-semibold"
                                            >
                                                Login
                                            </button>{" "}
                                            <span className="text-[var(--text-secondary)]">
                                                to comment
                                            </span>
                                        </div>
                                    )}

                                    {/* Comments */}
                                    {commentsLoading ? (
                                        <div className="flex justify-center py-12">
                                            <FaSpinner className="animate-spin text-xl text-[var(--brand-primary)]" />
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FaComment className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
                                            <p className="text-[var(--text-secondary)]">
                                                No comments yet
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {comments.map((comment) => (
                                                <CommentItem
                                                    key={comment._id}
                                                    comment={comment}
                                                    onLike={
                                                        handleCommentLikeClick
                                                    }
                                                    isLiking={
                                                        commentLikeLoading[
                                                            comment._id
                                                        ]
                                                    }
                                                    isAuthenticated={
                                                        isAuthenticated
                                                    }
                                                    onLoginPrompt={
                                                        handleLoginPrompt
                                                    }
                                                />
                                            ))}
                                            {commentsPagination?.hasMore && (
                                                <button
                                                    onClick={loadMoreComments}
                                                    className="w-full py-3 text-sm font-medium text-[var(--brand-primary)]"
                                                >
                                                    Load more
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Playlist Modal */}
            <PlaylistModal
                isOpen={showPlaylists}
                onClose={() => setShowPlaylists(false)}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
            />
        </div>
    );
};

export default VideoPlayer;
