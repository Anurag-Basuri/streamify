import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import axios from "axios";
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
} from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import useVideo from "../../hooks/useVideo";
import Spinner from "../Spinner";
import TimeAgo from "timeago-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoPlayer = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, authLoading } = useAuth();
    const playerRef = useRef(null);

    // State management
    const [isLiking, setIsLiking] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [playTriggered, setPlayTriggered] = useState(false);
    const [commentLikeLoading, setCommentLikeLoading] = useState({});
    const [likeState, setLikeState] = useState({
        isLiked: false,
        likesCount: 0,
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPlaylists, setShowPlaylists] = useState(false);
    const [playlists, setPlaylists] = useState([]);

    // Custom hooks
    const {
        isInWatchLater,
        addToWatchLater,
        removeFromWatchLater,
        fetchWatchLater,
        loading: watchLaterLoading,
    } = useWatchLater(isAuthenticated ? user : null);

    const {
        video,
        loading: videoLoading,
        error: videoError,
        fetchVideo,
        incrementViews,
        addToHistory,
    } = useVideo(isAuthenticated ? user : null, videoID);

    // Update like state when video changes
    useEffect(() => {
        if (video) {
            setLikeState({
                isLiked: video.isLiked || false,
                likesCount: video.likesCount || 0,
            });
        }
    }, [video]);

    // Fetch comments with like status
    const fetchComments = useCallback(async () => {
        if (!videoID) return;

        setCommentsLoading(true);
        try {
            const config = isAuthenticated
                ? {
                      headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                              "accessToken"
                          )}`,
                      },
                  }
                : {};

            const { data } = await axios.get(
                `/api/v1/comments/Video/${videoID}`,
                config
            );

            setComments(data?.data?.comments || []);
        } catch (err) {
            console.error("Comment fetch error:", err);
            toast.error("Failed to load comments");
        } finally {
            setCommentsLoading(false);
        }
    }, [videoID, isAuthenticated]);

    // Fetch playlists
    const fetchPlaylists = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await axios.get("/api/v1/playlists/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
            });
            setPlaylists(data.data.playlists || []);
        } catch (err) {
            console.error("Failed to fetch playlists:", err);
        }
    }, [isAuthenticated]);

    // Initial data load
    useEffect(() => {
        if (!videoID) return;

        const loadData = async () => {
            try {
                await Promise.all([
                    fetchVideo(),
                    fetchComments(),
                    isAuthenticated ? fetchPlaylists() : Promise.resolve(),
                ]);
            } catch (err) {
                console.error("Initial load error:", err);
            }
        };

        loadData();
    }, [videoID, fetchVideo, fetchComments, isAuthenticated, fetchPlaylists]);

    // Watch later sync
    useEffect(() => {
        if (isAuthenticated) {
            const syncWatchLater = async () => {
                try {
                    await fetchWatchLater();
                } catch (err) {
                    console.error("Watch later sync error:", err);
                }
            };
            syncWatchLater();
        }
    }, [isAuthenticated, fetchWatchLater]);

    // Video play handler with debounce
    const handlePlay = useCallback(async () => {
        if (!isAuthenticated || playTriggered) return;

        try {
            setPlayTriggered(true);
            await Promise.all([incrementViews(), addToHistory()]);
        } catch (err) {
            console.error("Play tracking error:", err);
        }
    }, [incrementViews, addToHistory, isAuthenticated, playTriggered]);

    // Like handler
    const handleVideoLike = async () => {
        if (!isAuthenticated) {
            navigate("/auth");
            return toast.info("Login to like videos");
        }

        if (!video?._id || isLiking) return;

        try {
            setIsLiking(true);

            // Optimistic update
            const newLikeState = {
                isLiked: !likeState.isLiked,
                likesCount: likeState.isLiked
                    ? Math.max(0, likeState.likesCount - 1)
                    : likeState.likesCount + 1,
            };
            setLikeState(newLikeState);

            const { data } = await axios.post(
                `/api/v1/likes/toggle/video/${video._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );

            // Update with server response
            if (data?.data) {
                setLikeState({
                    isLiked: data.data.state === 1,
                    likesCount: data.data.likes || 0,
                });
            }
        } catch (err) {
            // Revert optimistic update on error
            setLikeState({
                isLiked: likeState.isLiked,
                likesCount: likeState.likesCount,
            });
            toast.error(err.response?.data?.message || "Like action failed");
            console.error("Like error:", err);
        } finally {
            setIsLiking(false);
        }
    };

    // Comment submission
    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate("/auth");
            return toast.info("Login to comment");
        }

        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            await axios.post(
                `/api/v1/comments/Video/${videoID}`,
                { content: newComment.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setNewComment("");
            await fetchComments();
            toast.success("Comment added successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add comment");
            console.error("Comment error:", err);
        } finally {
            setCommentLoading(false);
        }
    };

    // Comment like handler with individual loading states
    const toggleCommentLike = async (commentId) => {
        if (!isAuthenticated) {
            navigate("/auth");
            return toast.info("Login to like comments");
        }

        if (commentLikeLoading[commentId]) return;

        try {
            setCommentLikeLoading((prev) => ({ ...prev, [commentId]: true }));

            await axios.post(
                `/api/v1/likes/toggle/comment/${commentId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            await fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || "Comment like failed");
            console.error("Comment like error:", err);
        } finally {
            setCommentLikeLoading((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    // Share handler
    const handleShare = useCallback(() => {
        const url = window.location.href;
        if (navigator.share) {
            navigator
                .share({
                    title: video?.title || "Check out this video",
                    text: video?.description || "",
                    url: url,
                })
                .catch((err) => {
                    console.error("Share failed:", err);
                    // Fallback to clipboard
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied to clipboard!");
                });
        } else {
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
        setIsMenuOpen(false);
    }, [video]);

    // Playlist handler
    const handleAddToPlaylist = async (playlistId) => {
        try {
            await axios.post(
                `/api/v1/playlists/${playlistId}/videos/${video._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            toast.success("Added to playlist!");
            setShowPlaylists(false);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to add to playlist"
            );
            console.error("Playlist error:", err);
        }
    };

    // Watch later handler
    const handleWatchLater = async () => {
        if (!isAuthenticated) {
            navigate("/auth");
            return toast.info("Login to use watch later");
        }

        if (!video?._id) return;

        try {
            if (isInWatchLater(video._id)) {
                await removeFromWatchLater(video._id);
                toast.success("Removed from Watch Later");
            } else {
                await addToWatchLater(video._id);
                toast.success("Added to Watch Later");
            }
        } catch (err) {
            toast.error("Watch later update failed");
            console.error("Watch later error:", err);
        }
    };

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

    // Loading states
    if (authLoading || videoLoading) return <Spinner />;

    // Error states
    if (videoError)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-red-500 text-2xl mb-4">Error</p>
                    <p className="text-gray-300">{videoError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );

    if (!video)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-400 text-2xl">Video not found</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                    <ReactPlayer
                        ref={playerRef}
                        key={videoID}
                        url={video.videoFile?.url}
                        controls
                        width="100%"
                        height="100%"
                        onPlay={handlePlay}
                        config={{
                            file: {
                                attributes: { controlsList: "nodownload" },
                            },
                            youtube: { playerVars: { modestbranding: 1 } },
                        }}
                        className="react-player"
                    />

                    {/* Floating Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative menu-container">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-3 rounded-full backdrop-blur-sm bg-gray-900/50 text-gray-100 hover:bg-gray-800 transition-colors"
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
                                        className="absolute right-0 top-14 bg-gray-800 rounded-lg shadow-xl py-2 w-48 z-50"
                                    >
                                        <button
                                            onClick={handleWatchLater}
                                            disabled={watchLaterLoading}
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {watchLaterLoading ? (
                                                <FaSpinner className="animate-spin text-yellow-400" />
                                            ) : isInWatchLater(video._id) ? (
                                                <FaClock className="text-yellow-400" />
                                            ) : (
                                                <FaRegClock className="text-yellow-400" />
                                            )}
                                            {isInWatchLater(video._id)
                                                ? "Remove Watch Later"
                                                : "Watch Later"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPlaylists(true);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <FaPlus className="text-purple-400" />
                                            Add to Playlist
                                        </button>
                                        <a
                                            href={video.videoFile?.url}
                                            download
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-700 flex items-center gap-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FaDownload className="text-blue-400" />
                                            Download
                                        </a>
                                        <button
                                            onClick={handleShare}
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <FaShare className="text-green-400" />
                                            Share
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Video Metadata */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-3xl font-bold text-gray-100">
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
                                    className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
                                />
                                <div>
                                    <p className="font-medium">
                                        {video.owner?.userName ||
                                            "Unknown Creator"}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaEye className="text-gray-400" />
                                        {video.views?.toLocaleString() ||
                                            0}{" "}
                                        views
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FaCalendarAlt />
                                    <span className="text-sm">
                                        <TimeAgo datetime={video.createdAt} />
                                    </span>
                                </div>
                                <button
                                    onClick={handleVideoLike}
                                    disabled={isLiking}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {isLiking ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : likeState.isLiked ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart className="text-gray-100" />
                                    )}
                                    <span className="font-medium">
                                        {likeState.likesCount?.toLocaleString() ||
                                            0}
                                    </span>
                                </button>
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
                                        className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">
                                                Add to Playlist
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    setShowPlaylists(false)
                                                }
                                                className="p-2 hover:bg-gray-700 rounded-full text-xl transition-colors"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {playlists.length === 0 ? (
                                                <p className="text-gray-400 text-center py-4">
                                                    No playlists found
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
                                                        className="w-full p-3 text-left hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors"
                                                    >
                                                        <span className="truncate text-purple-400">
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

                        {video.description && (
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                                    {video.description}
                                </p>
                            </div>
                        )}

                        {video.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {video.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="px-3 py-1.5 text-sm bg-purple-900/30 text-purple-300 rounded-full hover:bg-purple-900/50 transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-700 pt-8 lg:pt-0 lg:pl-8">
                        <div className="sticky top-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FaComment className="text-purple-500" />
                                {comments.length} Comments
                            </h3>

                            {/* Comment Input */}
                            {isAuthenticated ? (
                                <form
                                    onSubmit={handleAddComment}
                                    className="mb-8"
                                >
                                    <div className="flex gap-3 items-start">
                                        <img
                                            src={
                                                user?.avatar ||
                                                "/default-avatar.png"
                                            }
                                            alt={user?.userName || "User"}
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
                                                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 pr-20 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500 transition-colors"
                                                disabled={commentLoading}
                                                maxLength={500}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    !newComment.trim() ||
                                                    commentLoading
                                                }
                                                className="absolute right-2 top-2 bg-purple-600 px-3 py-1 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {commentLoading
                                                    ? "Posting..."
                                                    : "Post"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="mb-8 p-4 bg-gray-800 rounded-lg text-center">
                                    <button
                                        onClick={() => navigate("/auth")}
                                        className="text-purple-400 hover:underline transition-colors"
                                    >
                                        Login
                                    </button>{" "}
                                    to comment
                                </div>
                            )}

                            {/* Comments List */}
                            {commentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <FaSpinner className="animate-spin text-2xl text-purple-500" />
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 comment-scrollbar">
                                    {comments.map((comment) => (
                                        <motion.div
                                            key={comment._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex gap-3"
                                        >
                                            <img
                                                src={
                                                    comment.owner?.avatar ||
                                                    "/default-avatar.png"
                                                }
                                                alt={
                                                    comment.owner?.userName ||
                                                    "User"
                                                }
                                                className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                                            />
                                            <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {comment.owner
                                                                ?.userName ||
                                                                "Anonymous User"}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            <TimeAgo
                                                                datetime={
                                                                    comment.createdAt
                                                                }
                                                            />
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            toggleCommentLike(
                                                                comment._id
                                                            )
                                                        }
                                                        disabled={
                                                            commentLikeLoading[
                                                                comment._id
                                                            ]
                                                        }
                                                        className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 text-sm transition-colors disabled:opacity-50"
                                                    >
                                                        {commentLikeLoading[
                                                            comment._id
                                                        ] ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : comment.isLiked ? (
                                                            <FaHeart className="text-red-500" />
                                                        ) : (
                                                            <FaRegHeart />
                                                        )}
                                                        <span>
                                                            {comment.likesCount ||
                                                                0}
                                                        </span>
                                                    </button>
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;