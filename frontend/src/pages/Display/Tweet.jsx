import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    SparklesIcon,
    PhotoIcon,
    FaceSmileIcon,
    ArrowsRightLeftIcon,
    HeartIcon,
    ArrowUpTrayIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import EmojiPicker from "emoji-picker-react";
import TimeAgo from "timeago-react";

const Tweet = () => {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState("");
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [comments, setComments] = useState({});
    const [activeTweet, setActiveTweet] = useState(null);
    const [newComment, setNewComment] = useState("");

    const tweetVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 120, damping: 20 },
        },
        exit: { opacity: 0, x: -50 },
    };

    const commentVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    };

    const fetchTweets = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/v1/tweets");
            setTweets(data.data || []);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch latest tweets"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTweets();
    }, [fetchTweets]);

    const fetchComments = useCallback(async (tweetId) => {
        try {
            const { data } = await axios.get(
                `/api/v1/comments/Tweet/${tweetId}`
            );
            setComments((prev) => ({
                ...prev,
                [tweetId]: data.data.comments || [],
            }));
            console.log(data.data);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch comments"
            );
        }
    }, []);

    const handleTweetSubmit = async (e) => {
        e.preventDefault();
        if (!newTweet.trim() && !selectedImage) return;

        const formData = new FormData();
        formData.append("content", newTweet);
        if (selectedImage) formData.append("image", selectedImage);

        try {
            const { data } = await axios.post(
                "/api/v1/tweets/create",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setTweets([data.data, ...tweets]);
            setNewTweet("");
            setSelectedImage(null);
            toast.success("Tweet created! 🚀");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post tweet");
        }
    };

    const toggleLike = async (tweetId) => {
        try {
            const { data } = await axios.post(`/api/v1/likes/tweet/${tweetId}`);
            setTweets((prev) =>
                prev.map((tweet) =>
                    tweet._id === tweetId
                        ? {
                              ...tweet,
                              likes: data.data.likes,
                              isLiked: data.data.state === 1,
                          }
                        : tweet
                )
            );
            toast.success(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to like tweet");
        }
    };

    const toggleCommentLike = async (commentId, tweetId) => {
        try {
            const { data } = await axios.post(
                `/api/v1/comments/like/${commentId}`
            );
            setComments((prev) => {
                const updatedComments = prev[tweetId]?.map((comment) =>
                    comment._id === commentId
                        ? {
                              ...comment,
                              likes: data.data.likes,
                              isLiked: data.data.state === 1,
                          }
                        : comment
                );
                return {
                    ...prev,
                    [tweetId]: updatedComments || [],
                };
            });
            toast.success(data.message);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to like comment"
            );
        }
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty!");
            return;
        }
    };

    const handleCommentSubmit = async (tweetId) => {
        if (!newComment.trim()) return;

        try {
            const { data } = await axios.post(
                setComments((prev) => {
                    const updatedComments = prev[tweetId]
                        ? [...prev[tweetId]]
                        : [];
                    updatedComments.unshift(data.data);
                    return {
                        ...prev,
                        [tweetId]: updatedComments,
                    };
                })
            );

            setComments((prev) => ({
                ...prev,
                [tweetId]: [data.data, ...(prev[tweetId] || [])],
            }));
            setNewComment("");
            if (!comments[tweetId] || comments[tweetId].length === 0) {
                fetchComments(tweetId);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to post comment"
            );
        }
    };

    const toggleCommentSection = (tweetId) => {
        setActiveTweet((prev) => (prev === tweetId ? null : tweetId));
        console.log(!comments[tweetId]);
        if (!comments[tweetId]) fetchComments(tweetId);
    };

    const charCountColor = useMemo(() => {
        if (newTweet.length > 250) return "text-red-400";
        if (newTweet.length > 200) return "text-yellow-400";
        return "text-gray-400";
    }, [newTweet.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10"
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <SparklesIcon className="w-12 h-12 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                                SparkHub
                            </h1>
                            <p className="text-gray-200 mt-2 font-medium">
                                Where ideas ignite conversations
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tweet Composition */}
                <motion.form
                    onSubmit={handleTweetSubmit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg border border-gray-700/50 space-y-4"
                >
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                                JD
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <textarea
                                value={newTweet}
                                onChange={(e) => setNewTweet(e.target.value)}
                                placeholder="What's sparking your mind today?"
                                className="w-full bg-transparent resize-none focus:outline-none text-lg md:text-xl placeholder-gray-400 min-h-[100px] leading-relaxed"
                                rows="3"
                                maxLength={280}
                            />

                            {selectedImage && (
                                <div className="relative group rounded-2xl overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Preview"
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-2 right-2 bg-gray-900/80 p-2 rounded-full hover:bg-gray-800 transition-all"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    <label className="cursor-pointer text-blue-400 hover:text-blue-300 transition-all p-2 rounded-full hover:bg-white/5">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <PhotoIcon className="w-6 h-6" />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowEmojiPicker(!showEmojiPicker)
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-all p-2 rounded-full hover:bg-white/5"
                                    >
                                        <FaceSmileIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`text-sm ${charCountColor}`}
                                    >
                                        {280 - newTweet.length}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={
                                            !newTweet.trim() && !selectedImage
                                        }
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Spark
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.form>

                {/* Tweets Feed */}
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="bg-gray-800/50 h-32 rounded-xl animate-pulse"
                            />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {tweets.map((tweet) => (
                                <motion.div
                                    key={tweet._id}
                                    variants={tweetVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-gray-700/50"
                                >
                                    {/* Tweet Content */}
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            {tweet.owner?.avatar ? (
                                                <img
                                                    src={tweet.owner.avatar}
                                                    alt="Avatar"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {tweet.owner
                                                        ?.fullName?.[0] || "U"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold">
                                                        {tweet.owner
                                                            ?.fullName ||
                                                            "Anonymous"}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        @
                                                        {tweet.owner
                                                            ?.userName ||
                                                            "unknown"}
                                                    </span>
                                                    <TimeAgo
                                                        datetime={
                                                            tweet.createdAt
                                                        }
                                                        className="text-sm text-gray-400"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        shareTweet(tweet._id)
                                                    }
                                                    className="text-gray-400 hover:text-blue-400 transition-all"
                                                >
                                                    <ShareIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <p className="text-gray-100 whitespace-pre-wrap">
                                                {tweet.content}
                                            </p>

                                            {tweet.image && (
                                                <img
                                                    src={tweet.image}
                                                    alt="Tweet content"
                                                    className="mt-3 rounded-xl max-h-96 object-contain"
                                                />
                                            )}

                                            {/* Tweet Actions */}
                                            <div className="flex items-center justify-between pt-3">
                                                <div className="flex items-center gap-6 text-gray-400">
                                                    <button
                                                        onClick={() =>
                                                            toggleCommentSection(
                                                                tweet._id
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-blue-400 transition-all"
                                                    >
                                                        <ChatBubbleLeftIcon className="w-5 h-5" />
                                                        <span className="text-sm">
                                                            {comments[tweet._id]
                                                                ?.length || 0}
                                                        </span>
                                                    </button>

                                                    <button className="flex items-center gap-1 hover:text-green-400 transition-all">
                                                        <ArrowsRightLeftIcon className="w-5 h-5" />
                                                        <span className="text-sm">
                                                            {tweet.retweets ||
                                                                0}
                                                        </span>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            toggleLike(
                                                                tweet._id
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-red-400 transition-all"
                                                    >
                                                        {tweet.isLiked ? (
                                                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                        ) : (
                                                            <HeartIcon className="w-5 h-5" />
                                                        )}
                                                        <span className="text-sm">
                                                            {tweet.likes || 0}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Comment Section */}
                                            {activeTweet === tweet._id && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-4 space-y-4"
                                                >
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={newComment}
                                                            onChange={(e) =>
                                                                setNewComment(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Add your spark..."
                                                            className="flex-1 bg-gray-700/50 rounded-full px-4 py-2 focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                handleCommentSubmit(
                                                                    tweet._id
                                                                )
                                                            }
                                                            className="bg-blue-500/50 hover:bg-blue-500/70 px-4 rounded-full transition-all"
                                                        >
                                                            Post
                                                        </button>
                                                    </div>

                                                    <AnimatePresence>
                                                        {comments[
                                                            tweet._id
                                                        ]?.map((comment) => (
                                                            <motion.div
                                                                key={
                                                                    comment._id
                                                                }
                                                                variants={
                                                                    commentVariants
                                                                }
                                                                className="bg-gray-700/30 p-3 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            comment
                                                                                .owner
                                                                                .userName
                                                                        }
                                                                    </span>
                                                                    <TimeAgo
                                                                        datetime={
                                                                            comment.createdAt
                                                                        }
                                                                        className="text-xs text-gray-400"
                                                                    />
                                                                </div>
                                                                <p className="mt-1 text-sm">
                                                                    {
                                                                        comment.content
                                                                    }
                                                                </p>
                                                                <button
                                                                    onClick={() =>
                                                                        toggleCommentLike(
                                                                            comment._id,
                                                                            tweet._id
                                                                        )
                                                                    }
                                                                    className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-400"
                                                                >
                                                                    {comment.isLiked ? (
                                                                        <HeartSolidIcon className="w-4 h-4" />
                                                                    ) : (
                                                                        <HeartIcon className="w-4 h-4" />
                                                                    )}
                                                                    <span>
                                                                        {
                                                                            comment.likes
                                                                        }
                                                                    </span>
                                                                </button>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tweet;