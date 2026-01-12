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
        <div className="bg-[var(--bg-elevated)] p-8 rounded-2xl shadow-xl text-center max-w-md mx-4 border border-[var(--border-light)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--error-light)] flex items-center justify-center">
                <FaExclamationTriangle className="w-8 h-8 text-[var(--error)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Failed to Load Video
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onGoBack}
                    className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                >
                    <FaArrowLeft size={14} />
                    Go Back
                </button>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary-hover)] transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    </div>
);

// ============================================================================
// NOT FOUND STATE
// ============================================================================

const NotFoundState = ({ onGoHome }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="bg-[var(--bg-elevated)] p-8 rounded-2xl shadow-xl text-center max-w-md mx-4 border border-[var(--border-light)]">
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
                className="px-6 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary-hover)] transition-colors"
            >
                Browse Videos
            </button>
        </div>
    </div>
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
        className="flex gap-3"
    >
        <img
            src={comment.owner?.avatar || "/default-avatar.png"}
            alt={comment.owner?.userName || "User"}
            className="w-9 h-9 rounded-full flex-shrink-0 object-cover border border-[var(--border-light)]"
        />
        <div className="flex-1 bg-[var(--bg-secondary)] p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-medium text-sm text-[var(--text-primary)]">
                        {comment.owner?.userName || "Anonymous"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                        <TimeAgo datetime={comment.createdAt} />
                    </p>
                </div>
                <button
                    onClick={() =>
                        isAuthenticated ? onLike(comment._id) : onLoginPrompt()
                    }
                    disabled={isLiking}
                    className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] text-sm transition-colors disabled:opacity-50"
                >
                    {isLiking ? (
                        <FaSpinner className="animate-spin" size={12} />
                    ) : comment.isLiked ? (
                        <FaHeart className="text-[var(--error)]" size={12} />
                    ) : (
                        <FaRegHeart size={12} />
                    )}
                    <span>{comment.likesCount || 0}</span>
                </button>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
            </p>
        </div>
    </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VideoPlayer = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);

    // Auth state
    const { isAuthenticated, user, authLoading } = useAuth();

    // Video player hook - consolidates video, likes, comments management
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPlaylists, setShowPlaylists] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [isTheaterMode, setIsTheaterMode] = useState(false);

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

    // Sync watch later and playlists on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchLater().catch(console.error);
            fetchPlaylists();
        }
    }, [isAuthenticated, fetchWatchLater, fetchPlaylists]);

    // Click outside handler for menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest(".menu-container")) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (videoLoading || videoError) return;

            // Spacebar and K: Play/Pause
            if (
                (e.key === " " || e.key.toLowerCase() === "k") &&
                playerRef.current
            ) {
                e.preventDefault();
                playerRef.current.getInternalPlayer().paused
                    ? playerRef.current.getInternalPlayer().play()
                    : playerRef.current.getInternalPlayer().pause();
            }

            // F: Toggle Fullscreen
            if (e.key.toLowerCase() === "f") {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    playerRef.current.wrapper.requestFullscreen();
                }
            }

            // T: Toggle Theater Mode
            if (e.key.toLowerCase() === "t") {
                setIsTheaterMode((prev) => !prev);
            }

            // Esc: Exit fullscreen or theater mode
            if (e.key === "Escape") {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (isTheaterMode) {
                    setIsTheaterMode(false);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [videoLoading, videoError, isTheaterMode]);

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

    const handleShare = useCallback(() => {
        const url = window.location.href;
        if (navigator.share) {
            navigator
                .share({
                    title: video?.title || "Check out this video",
                    text: video?.description || "",
                    url,
                })
                .catch(() => {
                    navigator.clipboard.writeText(url);
                    showSuccess("Link copied!");
                });
        } else {
            navigator.clipboard.writeText(url);
            showSuccess("Link copied to clipboard!");
        }
        setIsMenuOpen(false);
    }, [video]);

    const handleWatchLater = async () => {
        if (!isAuthenticated) {
            showInfo("Login to use watch later");
            navigate("/auth");
            return;
        }
        if (!video?._id) return;

        try {
            if (isInWatchLater(video._id)) {
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
            className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] ${
                isTheaterMode ? "theater-mode" : ""
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                    <ReactPlayer
                        ref={playerRef}
                        key={videoID}
                        url={video.videoFile?.url}
                        controls
                        width="100%"
                        height="100%"
                        onPlay={handleVideoPlay}
                        config={{
                            file: {
                                attributes: { controlsList: "nodownload" },
                            },
                        }}
                        className="react-player"
                    />

                    {/* Floating Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative menu-container">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-3 rounded-full backdrop-blur-sm bg-black/50 text-white hover:bg-black/70 transition-colors"
                                aria-label="Video options"
                            >
                                <FaEllipsisV />
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-14 bg-[var(--bg-elevated)] rounded-xl shadow-xl py-2 w-48 z-50 border border-[var(--border-light)]"
                                    >
                                        <button
                                            onClick={handleWatchLater}
                                            disabled={watchLaterLoading}
                                            className="w-full px-4 py-2.5 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-3 disabled:opacity-50 text-[var(--text-primary)]"
                                        >
                                            {watchLaterLoading ? (
                                                <FaSpinner className="animate-spin text-[var(--warning)]" />
                                            ) : isInWatchLater(video._id) ? (
                                                <FaClock className="text-[var(--warning)]" />
                                            ) : (
                                                <FaRegClock className="text-[var(--warning)]" />
                                            )}
                                            {isInWatchLater(video._id)
                                                ? "Remove from"
                                                : "Watch Later"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    handleLoginPrompt();
                                                    return;
                                                }
                                                setShowPlaylists(true);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-3 text-[var(--text-primary)]"
                                        >
                                            <FaPlus className="text-[var(--brand-primary)]" />
                                            Add to Playlist
                                        </button>
                                        <a
                                            href={video.videoFile?.url}
                                            download
                                            className="w-full px-4 py-2.5 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-3 text-[var(--text-primary)]"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FaDownload className="text-[var(--info)]" />
                                            Download
                                        </a>
                                        <button
                                            onClick={handleShare}
                                            className="w-full px-4 py-2.5 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-3 text-[var(--text-primary)]"
                                        >
                                            <FaShare className="text-[var(--success)]" />
                                            Share
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Video Metadata */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                            {video.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        video.owner?.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt={video.owner?.userName || "User"}
                                    className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] object-cover"
                                />
                                <div>
                                    <p className="font-medium text-[var(--text-primary)]">
                                        {video.owner?.userName ||
                                            "Unknown Creator"}
                                    </p>
                                    <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-2">
                                        <FaEye />
                                        {formatViews(video.views)} views
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                                    <FaCalendarAlt />
                                    <span className="text-sm">
                                        <TimeAgo datetime={video.createdAt} />
                                    </span>
                                </div>
                                <button
                                    onClick={handleVideoLike}
                                    disabled={isLiking}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
                                >
                                    {isLiking ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : likeState.isLiked ? (
                                        <FaHeart className="text-[var(--error)]" />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                    <span className="font-medium">
                                        {likeState.likesCount?.toLocaleString() ||
                                            0}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        {video.description && (
                            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl">
                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                    {video.description}
                                </p>
                            </div>
                        )}

                        {/* Tags */}
                        {video.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {video.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="px-3 py-1.5 text-sm bg-[var(--brand-primary-light)] text-[var(--brand-primary)] rounded-full hover:bg-[var(--brand-primary)] hover:text-white transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-[var(--divider)] pt-6 lg:pt-0 lg:pl-8">
                        <div className="sticky top-24">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                                <FaComment className="text-[var(--brand-primary)]" />
                                {comments.length} Comments
                            </h3>

                            {/* Comment Input */}
                            {isAuthenticated ? (
                                <form
                                    onSubmit={handleCommentSubmit}
                                    className="mb-6"
                                >
                                    <div className="flex gap-3 items-start">
                                        <img
                                            src={
                                                user?.avatar ||
                                                "/default-avatar.png"
                                            }
                                            alt={user?.userName || "You"}
                                            className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                                        />
                                        <div className="flex-1 relative">
                                            <input
                                                value={newComment}
                                                onChange={(e) =>
                                                    setNewComment(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Add a comment..."
                                                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-2.5 pr-20 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none placeholder-[var(--text-tertiary)] text-[var(--text-primary)] transition-all"
                                                disabled={commentSubmitting}
                                                maxLength={500}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    !newComment.trim() ||
                                                    commentSubmitting
                                                }
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--brand-primary)] px-3 py-1.5 rounded-lg text-sm text-white hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {commentSubmitting ? (
                                                    <FaSpinner className="animate-spin" />
                                                ) : (
                                                    "Post"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-xl text-center">
                                    <button
                                        onClick={() => navigate("/auth")}
                                        className="text-[var(--brand-primary)] hover:underline font-medium"
                                    >
                                        Login
                                    </button>{" "}
                                    <span className="text-[var(--text-secondary)]">
                                        to comment
                                    </span>
                                </div>
                            )}

                            {/* Comments List */}
                            {commentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <FaSpinner className="animate-spin text-2xl text-[var(--brand-primary)]" />
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-[var(--text-tertiary)] text-center py-8">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                                    <AnimatePresence>
                                        {comments.map((comment) => (
                                            <CommentItem
                                                key={comment._id}
                                                comment={comment}
                                                onLike={handleCommentLikeClick}
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

                                    {/* Load More */}
                                    {commentsPagination.hasMore && (
                                        <button
                                            onClick={loadMoreComments}
                                            className="w-full py-2 text-sm text-[var(--brand-primary)] hover:underline"
                                        >
                                            Load more comments
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Playlist Modal */}
                <AnimatePresence>
                    {showPlaylists && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center"
                            onClick={() => setShowPlaylists(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-[var(--bg-elevated)] rounded-2xl p-6 w-full max-w-md mx-4 border border-[var(--border-light)]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                                        Add to Playlist
                                    </h3>
                                    <button
                                        onClick={() => setShowPlaylists(false)}
                                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-full text-xl transition-colors text-[var(--text-secondary)]"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {playlists.length === 0 ? (
                                        <p className="text-[var(--text-tertiary)] text-center py-4">
                                            No playlists found. Create one
                                            first!
                                        </p>
                                    ) : (
                                        playlists.map((playlist) => (
                                            <button
                                                key={playlist._id}
                                                onClick={() =>
                                                    handleAddToPlaylist(
                                                        playlist._id
                                                    )
                                                }
                                                className="w-full p-3 text-left hover:bg-[var(--bg-secondary)] rounded-xl flex items-center gap-3 transition-colors text-[var(--text-primary)]"
                                            >
                                                <FaPlus className="text-[var(--brand-primary)]" />
                                                <span className="truncate">
                                                    {playlist.name}
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VideoPlayer;
