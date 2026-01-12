import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import {
    FaSpinner,
    FaClock,
    FaRegClock,
    FaHeart,
    FaRegHeart,
    FaComment,
    FaEye,
    FaCalendarAlt,
    FaEllipsisV,
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
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TimeAgo from "timeago-react";

// Hooks and services
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import useVideoPlayer from "../../hooks/useVideoPlayer";
import { api } from "../../services/api";
import { showSuccess, showError, showInfo } from "../Common/ToastProvider";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toLocaleString();
};

// ============================================================================
// LOADING SKELETON
// ============================================================================

const VideoSkeleton = () => (
    <div className="min-h-screen bg-[var(--bg-primary)] animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="aspect-video bg-[var(--bg-tertiary)] rounded-2xl" />
            <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-10 w-24 bg-[var(--bg-tertiary)] rounded-full"
                        />
                    ))}
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-8 bg-[var(--bg-tertiary)] rounded w-3/4" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32" />
                            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-24" />
                        </div>
                        <div className="h-10 w-28 bg-[var(--bg-tertiary)] rounded-full" />
                    </div>
                    <div className="h-32 bg-[var(--bg-tertiary)] rounded-xl" />
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <div className="h-6 bg-[var(--bg-tertiary)] rounded w-32" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full" />
                            <div className="flex-1 h-20 bg-[var(--bg-tertiary)] rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// ERROR STATE
// ============================================================================

const ErrorState = ({ error, onRetry, onGoBack }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-elevated)] p-8 rounded-2xl shadow-xl text-center max-w-md mx-4 border border-[var(--border-light)]"
        >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <FaExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Failed to Load Video
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onGoBack}
                    className="px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-tertiary)] transition-all flex items-center gap-2 font-medium"
                >
                    <FaArrowLeft size={14} />
                    Go Back
                </button>
                <button
                    onClick={onRetry}
                    className="px-4 py-2.5 bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-primary-hover)] transition-all font-medium"
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--bg-elevated)] p-8 rounded-2xl shadow-xl text-center max-w-md mx-4 border border-[var(--border-light)]"
        >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                <FaEye className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Video Not Found
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
                This video may have been removed or is no longer available.
            </p>
            <button
                onClick={onGoHome}
                className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-primary-hover)] transition-all font-medium"
            >
                Browse Videos
            </button>
        </motion.div>
    </div>
);

// ============================================================================
// ACTION BUTTON
// ============================================================================

const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    active,
    disabled,
    loading,
}) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${
                active
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            }
        `}
    >
        {loading ? (
            <FaSpinner className="animate-spin" size={16} />
        ) : (
            <Icon size={16} className={active ? "text-white" : ""} />
        )}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

// ============================================================================
// COMMENT ITEM
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
        exit={{ opacity: 0, y: -10 }}
        layout
        className="flex gap-3 group"
    >
        <Link to={`/profile/${comment.owner?._id}`}>
            <img
                src={comment.owner?.avatar || "/default-avatar.png"}
                alt={comment.owner?.userName || "User"}
                className="w-10 h-10 rounded-full flex-shrink-0 object-cover border-2 border-transparent hover:border-[var(--brand-primary)] transition-colors"
            />
        </Link>
        <div className="flex-1 bg-[var(--bg-secondary)] p-4 rounded-2xl hover:bg-[var(--bg-tertiary)] transition-colors">
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                    <Link
                        to={`/profile/${comment.owner?._id}`}
                        className="font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                        {comment.owner?.userName || "Anonymous"}
                    </Link>
                    <span className="text-xs text-[var(--text-tertiary)] ml-2">
                        <TimeAgo datetime={comment.createdAt} />
                    </span>
                </div>
                <button
                    onClick={() =>
                        isAuthenticated ? onLike(comment._id) : onLoginPrompt()
                    }
                    disabled={isLiking}
                    className={`
                        flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                        transition-all duration-200 disabled:opacity-50
                        ${
                            comment.isLiked
                                ? "bg-red-500/10 text-red-500"
                                : "text-[var(--text-tertiary)] hover:bg-[var(--bg-primary)] hover:text-[var(--brand-primary)]"
                        }
                    `}
                >
                    {isLiking ? (
                        <FaSpinner className="animate-spin" size={12} />
                    ) : comment.isLiked ? (
                        <FaHeart size={12} />
                    ) : (
                        <FaRegHeart size={12} />
                    )}
                    <span>{comment.likesCount || 0}</span>
                </button>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2 whitespace-pre-wrap break-words">
                {comment.content}
            </p>
        </div>
    </motion.div>
);

// ============================================================================
// DESCRIPTION BOX
// ============================================================================

const DescriptionBox = ({ description, views, createdAt }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = description?.length > 200;

    return (
        <motion.div
            layout
            className="bg-[var(--bg-secondary)] p-4 rounded-2xl cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
            onClick={() => isLong && setExpanded(!expanded)}
        >
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)] mb-2">
                <span>{formatViews(views)} views</span>
                <span className="text-[var(--text-tertiary)]">•</span>
                <TimeAgo
                    datetime={createdAt}
                    className="text-[var(--text-tertiary)]"
                />
            </div>
            <motion.div layout className="overflow-hidden">
                <p
                    className={`text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap ${
                        !expanded && isLong ? "line-clamp-3" : ""
                    }`}
                >
                    {description || "No description provided."}
                </p>
            </motion.div>
            {isLong && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="mt-2 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] flex items-center gap-1 transition-colors"
                >
                    {expanded ? (
                        <>
                            Show less <FaChevronUp size={12} />
                        </>
                    ) : (
                        <>
                            Show more <FaChevronDown size={12} />
                        </>
                    )}
                </button>
            )}
        </motion.div>
    );
};

// ============================================================================
// PLAYLIST MODAL
// ============================================================================

const PlaylistModal = ({ isOpen, onClose, playlists, onAddToPlaylist }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[var(--bg-elevated)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-light)] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                            Save to Playlist
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-secondary)]"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {playlists.length === 0 ? (
                            <div className="text-center py-8">
                                <FaPlus className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
                                <p className="text-[var(--text-secondary)]">
                                    No playlists yet
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    Create one to save videos
                                </p>
                            </div>
                        ) : (
                            playlists.map((playlist) => (
                                <button
                                    key={playlist._id}
                                    onClick={() =>
                                        onAddToPlaylist(playlist._id)
                                    }
                                    className="w-full p-3 text-left hover:bg-[var(--bg-secondary)] rounded-xl flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                        <FaPlus className="text-[var(--brand-primary)] group-hover:scale-110 transition-transform" />
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
                                </button>
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
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);

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
    const checkSubscription = useCallback(async () => {
        if (!isAuthenticated || !video?.owner?._id) return;
        try {
            const { data } = await api.get(
                `/api/v1/subscriptions/check/${video.owner._id}`
            );
            setIsSubscribed(data.data?.isSubscribed || false);
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
        checkSubscription();
    }, [checkSubscription]);

    // Keyboard shortcuts
    useEffect(() => {
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
    }, []);

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
            await api.post(`/api/v1/subscriptions/toggle/${video.owner._id}`);
            setIsSubscribed((prev) => !prev);
            showSuccess(isSubscribed ? "Unsubscribed" : "Subscribed!");
        } catch (err) {
            showError(err.response?.data?.message || "Subscription failed");
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
                    text: video?.description?.slice(0, 100) || "",
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                showSuccess("Link copied to clipboard!");
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
            showInfo("Login to use watch later");
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
            showError("Watch later update failed");
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
            showError(
                err.response?.data?.message || "Failed to add to playlist"
            );
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

    return (
        <div
            className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-300 ${
                theaterMode ? "px-0" : ""
            }`}
        >
            <div
                className={`mx-auto transition-all duration-300 ${
                    theaterMode
                        ? "max-w-full px-0"
                        : "max-w-7xl px-4 sm:px-6 lg:px-8"
                } py-4 sm:py-6`}
            >
                {/* Video Player Container */}
                <div
                    ref={playerContainerRef}
                    className={`relative bg-black overflow-hidden shadow-2xl transition-all duration-300 ${
                        theaterMode
                            ? "rounded-none aspect-[21/9]"
                            : "rounded-2xl aspect-video"
                    }`}
                >
                    <ReactPlayer
                        ref={playerRef}
                        key={videoID}
                        url={video.videoFile?.url}
                        controls
                        width="100%"
                        height="100%"
                        onPlay={handleVideoPlay}
                        onProgress={({ played }) => setPlayed(played)}
                        onDuration={setDuration}
                        config={{
                            file: {
                                attributes: { controlsList: "nodownload" },
                            },
                        }}
                        className="react-player"
                    />

                    {/* Theater Mode Toggle */}
                    <button
                        onClick={() => setTheaterMode(!theaterMode)}
                        className="absolute bottom-16 right-4 p-2 rounded-lg backdrop-blur-sm bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 hover:opacity-100 focus:opacity-100"
                        title={
                            theaterMode
                                ? "Exit theater mode (T)"
                                : "Theater mode (T)"
                        }
                    >
                        {theaterMode ? (
                            <FaCompress size={16} />
                        ) : (
                            <FaExpand size={16} />
                        )}
                    </button>
                </div>

                {/* Action Bar - Always Visible */}
                <div
                    className={`mt-4 flex flex-wrap items-center gap-2 sm:gap-3 ${
                        theaterMode ? "px-4 sm:px-6 lg:px-8" : ""
                    }`}
                >
                    <ActionButton
                        icon={likeState.isLiked ? FaHeart : FaRegHeart}
                        label={formatViews(likeState.likesCount)}
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
                        label={isVideoInWatchLater ? "Saved" : "Save"}
                        onClick={handleWatchLater}
                        active={isVideoInWatchLater}
                        loading={watchLaterLoading}
                    />
                    <ActionButton
                        icon={FaPlus}
                        label="Playlist"
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
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                    >
                        <FaDownload size={16} />
                        <span className="hidden sm:inline">Download</span>
                    </a>
                </div>

                {/* Content Grid */}
                <div
                    className={`mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 ${
                        theaterMode ? "px-4 sm:px-6 lg:px-8" : ""
                    }`}
                >
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Title */}
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight">
                            {video.title}
                        </h1>

                        {/* Channel Info & Subscribe */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <Link
                                to={`/profile/${video.owner?._id}`}
                                className="flex items-center gap-3 group"
                            >
                                <img
                                    src={
                                        video.owner?.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt={video.owner?.userName || "User"}
                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-transparent group-hover:border-[var(--brand-primary)] object-cover transition-colors"
                                />
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                                        {video.owner?.userName ||
                                            "Unknown Creator"}
                                    </p>
                                    <p className="text-sm text-[var(--text-tertiary)]">
                                        {video.owner?.subscribersCount || 0}{" "}
                                        subscribers
                                    </p>
                                </div>
                            </Link>

                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm
                                    transition-all duration-200 disabled:opacity-50
                                    ${
                                        isSubscribed
                                            ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                            : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
                                    }
                                `}
                            >
                                {subscribing ? (
                                    <FaSpinner
                                        className="animate-spin"
                                        size={16}
                                    />
                                ) : isSubscribed ? (
                                    <>
                                        <FaCheck size={14} />
                                        Subscribed
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus size={14} />
                                        Subscribe
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Description */}
                        <DescriptionBox
                            description={video.description}
                            views={video.views}
                            createdAt={video.createdAt}
                        />

                        {/* Tags */}
                        {video.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {video.tags.map((tag, index) => (
                                    <Link
                                        key={`${tag}-${index}`}
                                        to={`/search?q=${encodeURIComponent(
                                            tag
                                        )}`}
                                        className="px-3 py-1.5 text-sm bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full hover:bg-[var(--brand-primary)] hover:text-white transition-all font-medium"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-20">
                            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 sm:p-5">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                                    <FaComment className="text-[var(--brand-primary)]" />
                                    {comments.length} Comments
                                </h3>

                                {/* Comment Input */}
                                {isAuthenticated ? (
                                    <form
                                        onSubmit={handleCommentSubmit}
                                        className="mb-5"
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={
                                                    user?.avatar ||
                                                    "/default-avatar.png"
                                                }
                                                alt={user?.userName || "You"}
                                                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
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
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none placeholder-[var(--text-tertiary)] text-[var(--text-primary)] transition-all resize-none text-sm"
                                                    disabled={commentSubmitting}
                                                    maxLength={500}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-[var(--text-tertiary)]">
                                                        {newComment.length}/500
                                                    </span>
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            !newComment.trim() ||
                                                            commentSubmitting
                                                        }
                                                        className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                                    >
                                                        {commentSubmitting ? (
                                                            <FaSpinner
                                                                className="animate-spin"
                                                                size={14}
                                                            />
                                                        ) : null}
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="mb-5 p-4 bg-[var(--bg-primary)] rounded-xl text-center">
                                        <button
                                            onClick={() => navigate("/auth")}
                                            className="text-[var(--brand-primary)] hover:underline font-semibold"
                                        >
                                            Login
                                        </button>{" "}
                                        <span className="text-[var(--text-secondary)]">
                                            to join the conversation
                                        </span>
                                    </div>
                                )}

                                {/* Comments List */}
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                                    {commentsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <FaSpinner className="animate-spin text-2xl text-[var(--brand-primary)]" />
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FaComment className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
                                            <p className="text-[var(--text-secondary)]">
                                                No comments yet
                                            </p>
                                            <p className="text-sm text-[var(--text-tertiary)]">
                                                Be the first to share your
                                                thoughts!
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
                                                <button
                                                    onClick={loadMoreComments}
                                                    className="w-full py-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors"
                                                >
                                                    Load more comments
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Playlist Modal */}
                <PlaylistModal
                    isOpen={showPlaylists}
                    onClose={() => setShowPlaylists(false)}
                    playlists={playlists}
                    onAddToPlaylist={handleAddToPlaylist}
                />
            </div>
        </div>
    );
};

export default VideoPlayer;
