import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import axios from "axios";
import {
    FaSpinner,
    FaClock,
    FaHeart,
    FaRegHeart,
    FaComment,
} from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import useVideo from "../../hooks/useVideo";

const VideoPlayer = () => {
    const { videoID } = useParams();
    const { user } = useAuth();
    const watchLater = useWatchLater(user);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(true);

    const { video, loading, error, fetchVideo, incrementViews, addToHistory } =
        useVideo(user, videoID);

    // Fetch comments
    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        try {
            const { data } = await axios.get(
                `/api/v1/comments/Video/${videoID}`
            );
            setComments(data.data.comments || []);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch comments"
            );
        } finally {
            setCommentsLoading(false);
        }
    }, [videoID]);

    // Fetch video, comments and watch later on mount
    useEffect(() => {
        const fetchData = async () => {
            await fetchVideo();
            await watchLater.fetchWatchLater();
            await fetchComments();
        };
        fetchData();
        // eslint-disable-next-line
    }, [videoID]);

    // Handle video play event
    const handlePlay = useCallback(async () => {
        try {
            await incrementViews();
            await addToHistory();
        } catch (err) {
            toast.error("Failed to update video stats");
        }
    }, [incrementViews, addToHistory]);

    // Add new comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            await axios.post(`/api/v1/comments/Video/${videoID}`, {
                content: newComment,
            });
            setNewComment("");
            await fetchComments();
            toast.success("Comment added successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add comment");
        } finally {
            setCommentLoading(false);
        }
    };

    // Toggle comment like
    const toggleCommentLike = async (commentId) => {
        try {
            await axios.post(`/api/v1/comments/like/${commentId}`);
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
            toast.error(err.response?.data?.message || "Failed to toggle like");
        }
    };

    // Handle Watch Later
    const handleWatchLater = useCallback(async () => {
        if (!video?._id) return;
        try {
            if (watchLater.isInWatchLater(video._id)) {
                await watchLater.removeFromWatchLater(video._id);
            } else {
                await watchLater.addToWatchLater(video._id);
            }
        } catch (err) {
            toast.error("Failed to update watch later");
        }
    }, [video, watchLater]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <FaSpinner className="animate-spin text-5xl text-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-red-500 text-2xl mb-4">Error</p>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-400 text-2xl">Video not found.</p>
                </div>
            </div>
        );
    }

    const inWatchLater = watchLater.isInWatchLater(video._id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-0 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Video Player Section */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
                    {video?.videoFile?.url ? (
                        <>
                            <ReactPlayer
                                onPlay={handlePlay}
                                url={video.videoFile.url}
                                controls
                                width="100%"
                                height="100%"
                                playing
                                config={{
                                    file: {
                                        attributes: {
                                            controlsList: "nodownload",
                                        },
                                    },
                                }}
                            />
                            {/* Watch Later Button */}
                            {user && (
                                <button
                                    className={`absolute top-4 right-4 z-10 p-3 rounded-full shadow-lg transition-colors text-lg flex items-center gap-2
                                        ${
                                            inWatchLater
                                                ? "bg-yellow-400 text-white"
                                                : "bg-gray-900/80 text-yellow-400 hover:bg-yellow-500"
                                        }`}
                                    title={
                                        inWatchLater
                                            ? "Remove from Watch Later"
                                            : "Add to Watch Later"
                                    }
                                    onClick={handleWatchLater}
                                    disabled={watchLater.loading}
                                >
                                    <FaClock />
                                    <span className="hidden md:inline text-sm font-semibold">
                                        {inWatchLater ? "Saved" : "Watch Later"}
                                    </span>
                                    {watchLater.loading && (
                                        <FaSpinner className="ml-2 animate-spin" />
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Video not available</p>
                        </div>
                    )}
                </div>

                {/* Video Metadata Section */}
                <div className="mt-8 space-y-6 px-2 md:px-0">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {video?.title || "Untitled Video"}
                    </h1>
                    <p className="text-gray-300 text-lg mb-4">
                        {video?.description || "No description available."}
                    </p>
                    <div className="flex items-center gap-4">
                        <img
                            src={video?.owner?.avatar || "/default-avatar.png"}
                            alt={video?.owner?.userName || "Unknown User"}
                            className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
                        />
                        <div>
                            <p className="font-medium text-lg">
                                {video?.owner?.userName || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-400">
                                {video?.views?.toLocaleString() || 0} views
                            </p>
                        </div>
                    </div>
                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {video.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs font-medium bg-purple-700/30 text-purple-200 rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="mt-8 px-2 md:px-0">
                    <div className="border-t border-gray-700 pt-8">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FaComment className="text-purple-500" />
                            {comments.length} Comments
                        </h3>

                        {/* Add Comment Form */}
                        {user && (
                            <form onSubmit={handleAddComment} className="mb-8">
                                <div className="flex gap-4">
                                    <img
                                        src={
                                            user.avatar || "/default-avatar.png"
                                        }
                                        alt={user.userName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            placeholder="Add a comment..."
                                            className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-16 
                                            focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            disabled={commentLoading}
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-2 bg-purple-600 px-4 py-1 rounded-md
                                            hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={
                                                !newComment.trim() ||
                                                commentLoading
                                            }
                                        >
                                            {commentLoading ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Comments List */}
                        <div className="space-y-6">
                            {commentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <FaSpinner className="animate-spin text-2xl text-purple-500" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-gray-400 text-center py-8">
                                    No comments yet. Be the first to comment!
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div
                                        key={comment._id}
                                        className="flex gap-4"
                                    >
                                        <img
                                            src={
                                                comment.owner?.avatar ||
                                                "/default-avatar.png"
                                            }
                                            alt={comment.owner?.userName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="bg-gray-800 p-4 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">
                                                        {
                                                            comment.owner
                                                                ?.userName
                                                        }
                                                    </span>
                                                    <span className="text-gray-400 text-sm">
                                                        {new Date(
                                                            comment.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300">
                                                    {comment.content}
                                                </p>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <button
                                                        onClick={() =>
                                                            toggleCommentLike(
                                                                comment._id
                                                            )
                                                        }
                                                        className="flex items-center gap-2 text-sm hover:text-purple-400"
                                                    >
                                                        {comment.isLiked ? (
                                                            <FaHeart className="text-red-500" />
                                                        ) : (
                                                            <FaRegHeart className="text-gray-400" />
                                                        )}
                                                        <span>
                                                            {comment.likesCount}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
