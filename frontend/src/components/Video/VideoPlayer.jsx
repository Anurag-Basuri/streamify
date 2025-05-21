import { useEffect, useCallback, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
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
    const { user } = useAuth();
    const watchLater = useWatchLater(user);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);

    const { video, loading, error, fetchVideo, incrementViews, addToHistory } = 
        useVideo(user, videoID);

    // Fetch comments with authorization
    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        try {
            const { data } = await axios.get(`/api/v1/comments/Video/${videoID}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            setComments(data.data.comments || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load comments");
        } finally {
            setCommentsLoading(false);
        }
    }, [videoID]);

    useEffect(() => {
        const loadData = async () => {
            await fetchVideo();
            await watchLater.fetchWatchLater();
            await fetchComments();
        };
        loadData();
    }, [videoID, fetchVideo, watchLater, fetchComments]);

    const handlePlay = useCallback(async () => {
        try {
            await incrementViews();
            await addToHistory();
        } catch (err) {
            toast.error("Failed to update video stats");
        }
    }, [incrementViews, addToHistory]);

    const handleVideoLike = async () => {
        if (!video?._id || isLiking) return;
        try {
            setIsLiking(true);
            const { data } = await axios.post(`/api/v1/likes/video/${video._id}`);
            await fetchVideo();
            toast.success(data.message || "Like updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Like action failed");
        } finally {
            setIsLiking(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        try {
            setCommentLoading(true);
            await axios.post(
                `/api/v1/comments/Video/${videoID}`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
            );
            setNewComment("");
            await fetchComments();
            toast.success("Comment added");
        } catch (err) {
            toast.error(err.response?.data?.message || "Comment failed");
        } finally {
            setCommentLoading(false);
        }
    };

    const toggleCommentLike = async (commentId) => {
        try {
            await axios.post(`/api/v1/comments/like/${commentId}`);
            setComments(prev => prev.map(comment => 
                comment._id === commentId ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1
                } : comment
            ));
        } catch (err) {
            toast.error("Failed to toggle comment like");
        }
    };

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

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/auth" />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-red-500 text-2xl mb-4">Error</p>
                    <p className="text-gray-300">{error}</p>
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

    const inWatchLater = watchLater.isInWatchLater(video._id);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Video Player Section */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                    <ReactPlayer
                        url={video.videoFile?.url}
                        controls
                        width="100%"
                        height="100%"
                        onPlay={handlePlay}
                        config={{ file: { attributes: { controlsList: "nodownload" } } }}
                        className="react-player"
                    />
                    
                    {/* Floating Action Bar */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleVideoLike}
                            disabled={isLiking}
                            className={`p-3 rounded-full backdrop-blur-sm flex items-center gap-2 transition-colors ${
                                video.isLiked ? 'text-red-500 bg-gray-900/80' : 'text-gray-300 bg-gray-900/50 hover:bg-gray-900/80'
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
                                {video.likesCount?.toLocaleString()}
                            </span>
                        </button>

                        <button
                            onClick={handleWatchLater}
                            disabled={watchLater.loading}
                            className={`p-3 rounded-full backdrop-blur-sm flex items-center gap-2 transition-colors ${
                                inWatchLater ? 'bg-yellow-400/90 text-gray-900' : 'bg-gray-900/50 text-yellow-400 hover:bg-yellow-500/20'
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
                        <h1 className="text-3xl font-bold text-gray-100">{video.title}</h1>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <img
                                    src={video.owner?.avatar || "/default-avatar.png"}
                                    alt={video.owner?.userName}
                                    className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
                                />
                                <div>
                                    <p className="font-medium">{video.owner?.userName}</p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaEye className="mr-1" />
                                        {video.views?.toLocaleString()} views
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 ml-auto">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FaCalendarAlt />
                                    <span className="text-sm">
                                        Uploaded <TimeAgo datetime={video.createdAt} />
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
                                        {video.likesCount?.toLocaleString()}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {video.description && (
                            <p className="text-gray-300 text-lg">{video.description}</p>
                        )}

                        {video.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {video.tags.map(tag => (
                                    <span
                                        key={tag}
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
                            {user && (
                                <form onSubmit={handleAddComment} className="mb-8">
                                    <div className="flex gap-3 items-start">
                                        <img
                                            src={user.avatar || "/default-avatar.png"}
                                            alt={user.userName}
                                            className="w-9 h-9 rounded-full flex-shrink-0"
                                        />
                                        <div className="flex-1 relative">
                                            <input
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 pr-20 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500"
                                                disabled={commentLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim() || commentLoading}
                                                className="absolute right-2 top-2 bg-purple-600 px-3 py-1 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 transition-opacity"
                                            >
                                                {commentLoading ? "Posting..." : "Post"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
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
                                    {comments.map(comment => (
                                        <div key={comment._id} className="flex gap-3 group">
                                            <img
                                                src={comment.owner?.avatar || "/default-avatar.png"}
                                                alt={comment.owner?.userName}
                                                className="w-9 h-9 rounded-full flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <div className="bg-gray-800 p-4 rounded-lg relative">
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {comment.owner?.userName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                <TimeAgo datetime={comment.createdAt} />
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleCommentLike(comment._id)}
                                                            className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 text-sm"
                                                        >
                                                            {comment.isLiked ? (
                                                                <FaHeart className="text-red-500 text-sm" />
                                                            ) : (
                                                                <FaRegHeart className="text-sm" />
                                                            )}
                                                            <span>{comment.likesCount}</span>
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
