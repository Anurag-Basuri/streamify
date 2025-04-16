import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    SparklesIcon,
    PhotoIcon,
    FaceSmileIcon,
    HeartIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import EmojiPicker from "emoji-picker-react";
import TimeAgo from "timeago-react";

const Tweet = () => {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState("");
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [comments, setComments] = useState([]);
    const [activeTweet, setActiveTweet] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [initialLikesLoaded, setInitialLikesLoaded] = useState(false);

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
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    };

    const fetchTweets = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/v1/tweets");
            setTweets(data.data || []);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch tweets"
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
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch comments"
            );
        }
    }, []);

    const handleTweetSubmit = async (e) => {
        e.preventDefault();
        if (!newTweet.trim()) return;

        setIsPosting(true);
        try {
            const { data } = await axios.post("/api/v1/tweets/create", {
                content: newTweet,
            });
            etTweets([{ ...data.data, isLiked: false }, ...tweets]);
            setNewTweet("");
            toast.success("Spark ignited! 🔥");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post");
        } finally {
            setIsPosting(false);
        }
    };

    const toggleLike = async (tweetId) => {
        try {
            const { data } = await axios.post(`/api/v1/likes/tweet/${tweetId}`);
            setTweets((prev) =>
                prev.map((t) =>
                    t._id === tweetId
                        ? {
                              ...t,
                              likes: data.data.likes,
                              isLiked: data.data.state === 1,
                          }
                        : t
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Like action failed");
        }
    };

    const getLikedTweets = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/v1/likes/filter", {
                params: { entityType: "Tweet" },
            });
            const likedTweets = data.data.map((like) => like.likedEntity);
            setTweets((prev) =>
                prev.map((tweet) => ({
                    ...tweet,
                    isLiked: likedTweets.includes(tweet._id),
                }))
            );
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch liked tweets"
            );
        }
    }, []);

    useEffect(() => {
        if (tweets.length > 0 && !initialLikesLoaded) {
            getLikedTweets();
            setInitialLikesLoaded(true);
        }
    }, [tweets, getLikedTweets, initialLikesLoaded]);

    const countTweetComments = async (tweetId) => {
        try {
            const { data } = await axios.get(
                `/api/v1/comments/count/Tweet/${tweetId}`
            );
            setComments((prev) =>
                prev.map((tweet) => ({
                    ...tweet,
                    commentsCount: data.data.count || 0,
                }))
            );
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to count comments"
            );
        }
    };

    useEffect(() => {
        tweets.forEach((tweet) => {
            if (!comments[tweet._id]) countTweetComments(tweet._id);
        });
    }, [tweets, comments]);

    const handleCommentSubmit = async (tweetId) => {
        if (!newComment.trim()) return;

        try {
            const { data } = await axios.post(
                `/api/v1/comments/Tweet/${tweetId}`,
                { content: newComment }
            );
            setComments((prev) => ({
                ...prev,
                [tweetId]: [data.data, ...(prev[tweetId] || [])],
            }));
            setNewComment("");
            toast.success("Comment added! 💬");
        } catch (err) {
            toast.error(err.response?.data?.message || "Comment failed");
        }
    };

    const toggleCommentSection = (tweetId) => {
        setActiveTweet((prev) => (prev === tweetId ? null : tweetId));
        if (!comments[tweetId]) fetchComments(tweetId);
    };

    const charCountColor = useMemo(() => {
        const length = newTweet.length;
        if (length > 250) return "text-red-400";
        if (length > 200) return "text-yellow-400";
        return "text-gray-400";
    }, [newTweet.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl border border-white/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <SparklesIcon className="w-12 h-12 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                                SparkHub
                            </h1>
                            <p className="text-gray-200 mt-1">
                                Ignite conversations
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tweet Composition */}
                <motion.form
                    onSubmit={handleTweetSubmit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-700/50"
                >
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                XY
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <textarea
                                value={newTweet}
                                onChange={(e) => setNewTweet(e.target.value)}
                                placeholder="What's sparking your mind today?"
                                className="w-full bg-transparent resize-none focus:outline-none text-lg placeholder-gray-400 min-h-[100px] leading-relaxed"
                                rows="3"
                                maxLength={280}
                            />

                            <div className="flex justify-between items-center">
                                <div className="flex gap-2 relative">
                                    <button
                                        type="button"
                                        className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-white/5 transition-colors"
                                    >
                                        <PhotoIcon className="w-6 h-6 text-blue-400 hover:text-blue-300" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowEmojiPicker(!showEmojiPicker)
                                        }
                                        className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-white/5 transition-colors"
                                    >
                                        <FaceSmileIcon className="w-6 h-6" />
                                    </button>

                                    {showEmojiPicker && (
                                        <div className="absolute z-50 bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-2">
                                            <EmojiPicker
                                                onEmojiClick={(e) =>
                                                    setNewTweet(
                                                        (prev) => prev + e.emoji
                                                    )
                                                }
                                                theme="dark"
                                                width={300}
                                                height={300}
                                                searchDisabled
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`text-sm ${charCountColor}`}
                                    >
                                        {280 - newTweet.length}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={!newTweet.trim() || isPosting}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-5 py-2 rounded-full font-medium disabled:opacity-50 transition-all relative overflow-hidden"
                                    >
                                        {isPosting ? (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                Posting...
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                initial={{ opacity: 1 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                Spark
                                            </motion.span>
                                        )}
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
                                    className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            {tweet.owner?.avatar ? (
                                                <img
                                                    src={tweet.owner.avatar}
                                                    alt="Avatar"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {tweet.owner
                                                        ?.fullName?.[0] || "U"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            {/* Tweet Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
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
                                                    </div>
                                                    <TimeAgo
                                                        datetime={
                                                            tweet.createdAt
                                                        }
                                                        className="text-xs text-gray-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        navigator.clipboard.writeText(
                                                            `${window.location.origin}/tweet/${tweet._id}`
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-blue-400 p-1 rounded-full transition-colors"
                                                >
                                                    <ShareIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Tweet Content */}
                                            <p className="text-gray-100 whitespace-pre-wrap">
                                                {tweet.content}
                                            </p>

                                            {/* Tweet Actions */}
                                            <div className="flex items-center gap-6 text-gray-400 pt-2">
                                                <button
                                                    onClick={() =>
                                                        toggleCommentSection(
                                                            tweet._id
                                                        )
                                                    }
                                                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                                                >
                                                    <ChatBubbleLeftIcon className="w-5 h-5" />
                                                    <span className="text-sm">
                                                        {comments[tweet._id]
                                                            ?.length || 0}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleLike(tweet._id)
                                                    }
                                                    className="flex items-center gap-1 hover:text-red-400 transition-colors"
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
                                                            className="flex-1 bg-gray-700/50 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                handleCommentSubmit(
                                                                    tweet._id
                                                                )
                                                            }
                                                            className="bg-purple-500/50 hover:bg-purple-500/70 px-4 rounded-full text-sm transition-colors"
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
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <span className="font-medium text-purple-400">
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
                                                                <p className="mt-1 text-gray-100">
                                                                    {
                                                                        comment.content
                                                                    }
                                                                </p>
                                                                <button className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
                                                                    <HeartIcon className="w-4 h-4" />
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