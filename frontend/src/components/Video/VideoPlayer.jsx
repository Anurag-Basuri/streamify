import { useEffect, useCallback, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
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
} from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import useVideo from "../../hooks/useVideo";
import Spinner from "../Spinner";
import TimeAgo from "timeago-react";

const VideoPlayer = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);

    // Initialize watchLater hook with proper dependency
    const watchLater = useWatchLater(isAuthenticated ? user : null);

    const {
        video,
        loading: videoLoading,
        error: videoError,
        fetchVideo,
        incrementViews,
        addToHistory,
    } = useVideo(isAuthenticated ? user : null, videoID);

    // Fetch comments with proper error handling
    const fetchComments = useCallback(async () => {
        if (!videoID) return;

        setCommentsLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const config = token
                ? {
                      headers: { Authorization: `Bearer ${token}` },
                  }
                : {};

            const { data } = await axios.get(
                `/api/v1/comments/Video/${videoID}`,
                config
            );
            setComments(data?.data?.comments || []);
        } catch (err) {
            console.error("Error fetching comments:", err);
            // Don't show error toast for comments loading - non-critical
            setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    }, [videoID]);

    useEffect(() => {
        // Don't attempt to fetch if we don't have a videoID
        if (!videoID) return;

        const loadData = async () => {
            try {
                await fetchVideo();
                // Only fetch watch later if authenticated
                if (isAuthenticated) {
                    await watchLater.fetchWatchLater();
                }
                await fetchComments();
            } catch (err) {
                console.error("Error loading data:", err);
            }
        };

        loadData();
    }, [videoID, fetchVideo, watchLater, fetchComments, isAuthenticated]);

    // Properly handle video playback start
    const handlePlay = useCallback(async () => {
        if (!isAuthenticated) return; // Skip if not authenticated

        try {
            await incrementViews();
            await addToHistory();
        } catch (err) {
            console.error("Failed to update video stats:", err);
            // Don't show error toast - non-critical functionality
        }
    }, [incrementViews, addToHistory, isAuthenticated]);

    const handleVideoLike = async () => {
        if (!isAuthenticated) {
            toast.info("Please login to like videos");
            navigate("/auth");
            return;
        }

        if (!video?._id || isLiking) return;

        try {
            setIsLiking(true);
            const { data } = await axios.post(
                `/api/v1/likes/video/${video._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            await fetchVideo();
            toast.success(data.message || "Like updated");
        } catch (err) {
            console.error("Error liking video:", err);
            toast.error(err.response?.data?.message || "Like action failed");
        } finally {
            setIsLiking(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.info("Please login to comment");
            navigate("/auth");
            return;
        }

        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            await axios.post(
                `/api/v1/comments/Video/${videoID}`,
                { content: newComment },
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
            toast.success("Comment added");
        } catch (err) {
            console.error("Error adding comment:", err);
            toast.error(err.response?.data?.message || "Comment failed");
        } finally {
            setCommentLoading(false);
        }
    };

    const toggleCommentLike = async (commentId) => {
        if (!isAuthenticated) {
            toast.info("Please login to like comments");
            navigate("/auth");
            return;
        }

        try {
            await axios.post(
                `/api/v1/comments/like/${commentId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setComments((prev) =>
                prev.map((comment) =>
                    comment._id === commentId
                        ? {
                              ...comment,
                              isLiked: !comment.isLiked,
                              likesCount: comment.isLiked
                                  ? comment.likesCount - 1
                                  : comment.likesCount + 1,
                          }
                        : comment
                )
            );
        } catch (err) {
            console.error("Error toggling comment like:", err);
            toast.error("Failed to toggle comment like");
        }
    };

    const handleWatchLater = useCallback(async () => {
        if (!isAuthenticated) {
            toast.info("Please login to add to watch later");
            navigate("/auth");
            return;
        }

        if (!video?._id) return;

        try {
            if (watchLater.isInWatchLater(video._id)) {
                await watchLater.removeFromWatchLater(video._id);
            } else {
                await watchLater.addToWatchLater(video._id);
            }
        } catch (err) {
            console.error("Error updating watch later:", err);
            toast.error("Failed to update watch later");
        }
    }, [video, watchLater, isAuthenticated, navigate]);

    // Show loading indicator while authentication is being checked
    if (authLoading) return <Spinner />;

    // Show loading indicator while video is being fetched
    if (videoLoading) return <Spinner />;

    // Don't redirect if user is not authenticated - allow for public viewing
    // if (!user) return <Navigate to="/auth" />;

    if (videoError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-red-500 text-2xl mb-4">Error</p>
                    <p className="text-gray-300">{videoError}</p>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-400 text-2xl">Video not found.</p>
                </div>
            </div>
        );
    }

    const inWatchLater =
        isAuthenticated && watchLater.isInWatchLater(video._id);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Video Player Section */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                    <ReactPlayer
                        url={video.videoFile?.url}
                        controls
                        width="100%"
                        height="100%"
                        onPlay={handlePlay}
                        config={{
                            file: {
                                attributes: { controlsList: "nodownload" },
                            },
                        }}
                        className="react-player"
                    />

                    {/* Floating Action Bar */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleVideoLike}
                            disabled={isLiking}
                            className={`p-3 rounded-full backdrop-blur-sm flex items-center gap-2 transition-colors ${
                                video.isLiked
                                    ? "text-red-500 bg-gray-900/80"
                                    : "text-gray-300 bg-gray-900/50 hover:bg-gray-900/80"
                            }`}
                        >
                            {isLiking ? (
                                <FaSpinner className="animate-spin" />
                            ) : video.isLiked ? (
                                <FaHeart className="text-red-500" />
                            ) : (
                                <FaRegHeart />
                            )}
                            <span className="text-sm font-medium">
                                {video.likesCount?.toLocaleString() || 0}
                            </span>
                        </button>

                        <button
                            onClick={handleWatchLater}
                            disabled={watchLater.loading}
                            className={`p-3 rounded-full backdrop-blur-sm flex items-center gap-2 transition-colors ${
                                inWatchLater
                                    ? "bg-yellow-400/90 text-gray-900"
                                    : "bg-gray-900/50 text-yellow-400 hover:bg-yellow-500/20"
                            }`}
                        >
                            {watchLater.loading ? (
                                <FaSpinner className="animate-spin" />
                            ) : inWatchLater ? (
                                <FaClock />
                            ) : (
                                <FaRegClock />
                            )}
                        </button>
                    </div>
                </div>

                {/* Video Metadata Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-3xl font-bold text-gray-100">
                            {video.title}
                        </h1>

                        <div className="flex items-center gap-4 flex-wrap">
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
                                            "Unknown User"}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaEye className="mr-1" />
                                        {(
                                            video.views || 0
                                        ).toLocaleString()}{" "}
                                        views
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-auto">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FaCalendarAlt />
                                    <span className="text-sm">
                                        Uploaded{" "}
                                        <TimeAgo
                                            datetime={
                                                video.createdAt || new Date()
                                            }
                                        />
                                    </span>
                                </div>
                                <button
                                    onClick={handleVideoLike}
                                    disabled={isLiking}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    {isLiking ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : video.isLiked ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                    <span className="font-medium">
                                        {(
                                            video.likesCount || 0
                                        ).toLocaleString()}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {video.description && (
                            <p className="text-gray-300 text-lg">
                                {video.description}
                            </p>
                        )}

                        {video.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {video.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="px-3 py-1.5 text-sm bg-purple-900/30 text-purple-300 rounded-full"
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

                            {/* Comment Form */}
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
                                            className="w-9 h-9 rounded-full flex-shrink-0"
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
                                                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 pr-20 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500"
                                                disabled={commentLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    !newComment.trim() ||
                                                    commentLoading
                                                }
                                                className="absolute right-2 top-2 bg-purple-600 px-3 py-1 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 transition-opacity"
                                            >
                                                {commentLoading
                                                    ? "Posting..."
                                                    : "Post"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center mb-8 p-4 bg-gray-800 rounded-lg">
                                    <p className="text-gray-300">
                                        <button
                                            onClick={() => navigate("/auth")}
                                            className="text-purple-400 hover:underline"
                                        >
                                            Login
                                        </button>{" "}
                                        to add comments
                                    </p>
                                </div>
                            )}

                            {/* Comments List */}
                            {commentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <FaSpinner className="animate-spin text-2xl text-purple-500" />
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">
                                    No comments yet. Start the conversation!
                                </p>
                            ) : (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 comment-scrollbar">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment._id}
                                            className="flex gap-3 group"
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
                                                className="w-9 h-9 rounded-full flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <div className="bg-gray-800 p-4 rounded-lg relative">
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {comment.owner
                                                                    ?.userName ||
                                                                    "Unknown User"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                <TimeAgo
                                                                    datetime={
                                                                        comment.createdAt ||
                                                                        new Date()
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
                                                            className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 text-sm"
                                                        >
                                                            {comment.isLiked ? (
                                                                <FaHeart className="text-red-500 text-sm" />
                                                            ) : (
                                                                <FaRegHeart className="text-sm" />
                                                            )}
                                                            <span>
                                                                {comment.likesCount ||
                                                                    0}
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-300 text-sm">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
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