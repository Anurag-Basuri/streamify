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
    ChartBarIcon,
    ArrowUpTrayIcon,
    ChatBubbleLeftIcon,
    EllipsisHorizontalIcon,
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
    const [likedTweets, setLikedTweets] = useState(new Set());
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const tweetVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 120, damping: 20 },
        },
        exit: { opacity: 0, x: -50 },
    };

    // Memoized fetch function
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

    const handleTweetSubmit = async (e) => {
        e.preventDefault();
        if (!newTweet.trim() && !selectedImage) return;

        const formData = new FormData();
        formData.append("content", newTweet);
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        try {
            const { data } = await axios.post(
                "/api/v1/tweets/create",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setTweets([data.data, ...tweets]);
            setNewTweet("");
            setSelectedImage(null);
            toast.success("Tweet created!", {
                icon: "🚀",
                style: {
                    background: "#1a1a1a",
                    color: "#fff",
                },
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post tweet");
        }
    };

    const handleEmojiClick = (emojiData) => {
        setNewTweet((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast.error("Image size should be less than 5MB");
                return;
            }
            setSelectedImage(file);
        }
    };

    const toggleLike = async (tweetId) => {
        try {
            const isLiked = likedTweets.has(tweetId);
            const method = isLiked ? "delete" : "post";

            await axios[method](`/api/v1/tweets/like/${tweetId}`);

            setLikedTweets((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(tweetId)) {
                    newSet.delete(tweetId);
                } else {
                    newSet.add(tweetId);
                }
                return newSet;
            });

            setTweets(
                tweets.map((tweet) =>
                    tweet._id === tweetId
                        ? {
                              ...tweet,
                              likes: isLiked
                                  ? tweet.likes - 1
                                  : (tweet.likes || 0) + 1,
                          }
                        : tweet
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update like");
        }
    };

    const startEditing = (tweet) => {
        setEditingTweetId(tweet._id);
        setEditContent(tweet.content);
    };

    const cancelEditing = () => {
        setEditingTweetId(null);
        setEditContent("");
    };

    const handleEditSubmit = async (tweetId) => {
        try {
            const { data } = await axios.patch(`/api/v1/tweets/${tweetId}`, {
                content: editContent,
            });

            setTweets(
                tweets.map((tweet) =>
                    tweet._id === tweetId ? data.data : tweet
                )
            );
            setEditingTweetId(null);
            toast.success("Tweet updated!");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update tweet"
            );
        }
    };

    const deleteTweet = async (tweetId) => {
        try {
            await axios.delete(`/api/v1/tweets/${tweetId}`);
            setTweets(tweets.filter((tweet) => tweet._id !== tweetId));
            toast.success("Tweet deleted!");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete tweet"
            );
        }
    };

    // Memoized character count color
    const charCountColor = useMemo(() => {
        if (newTweet.length > 250) return "text-red-400";
        if (newTweet.length > 200) return "text-yellow-400";
        return "text-gray-400";
    }, [newTweet.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Animated Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl shadow-xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                    <div className="flex items-center gap-4 relative">
                        <div className="bg-yellow-400/20 p-3 rounded-xl">
                            <SparklesIcon className="w-12 h-12 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                                Global Feed
                            </h1>
                            <p className="text-gray-200 mt-2">
                                Connect with the world's pulse
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Enhanced Tweet Form */}
                <motion.form
                    onSubmit={handleTweetSubmit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 space-y-4"
                >
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-lg md:text-xl">
                                JD
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <textarea
                                value={newTweet}
                                onChange={(e) => setNewTweet(e.target.value)}
                                placeholder="What's happening?!"
                                className="w-full bg-transparent resize-none focus:outline-none text-lg md:text-xl placeholder-gray-400 min-h-[100px] md:min-h-[120px]"
                                rows="3"
                                maxLength={280}
                            />

                            {selectedImage && (
                                <div className="relative group">
                                    <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Preview"
                                        className="rounded-2xl border border-gray-700 w-full max-h-96 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-2 right-2 bg-gray-900/80 p-1 md:p-2 rounded-full hover:bg-gray-800 transition-all"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex gap-3 md:gap-4">
                                    <label className="cursor-pointer text-blue-400 hover:text-blue-300 transition-all">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <PhotoIcon className="w-5 h-5 md:w-6 md:h-6" />
                                    </label>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowEmojiPicker(
                                                    !showEmojiPicker
                                                )
                                            }
                                            className="text-blue-400 hover:text-blue-300 transition-all"
                                        >
                                            <FaceSmileIcon className="w-5 h-5 md:w-6 md:h-6" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute z-10 mt-2">
                                                <EmojiPicker
                                                    onEmojiClick={
                                                        handleEmojiClick
                                                    }
                                                    theme="dark"
                                                    width={300}
                                                    height={400}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:gap-4">
                                    <span
                                        className={`text-xs md:text-sm ${charCountColor}`}
                                    >
                                        {280 - newTweet.length}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={
                                            !newTweet.trim() && !selectedImage
                                        }
                                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 md:px-6 md:py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm md:text-base"
                                    >
                                        <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
                                        Tweet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.form>

                {/* Enhanced Tweets List */}
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl h-32 animate-gradient-shine bg-[length:200%_100%] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
                            />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {tweets.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-gray-400 space-y-4"
                                >
                                    <div className="text-6xl">🌠</div>
                                    <p className="text-xl">
                                        Nothing to see here yet...
                                    </p>
                                    <p className="text-gray-500">
                                        Be the first to spark a conversation!
                                    </p>
                                </motion.div>
                            ) : (
                                tweets.map((tweet) => (
                                    <motion.div
                                        key={tweet._id}
                                        variants={tweetVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all group"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg md:text-xl">
                                                    {tweet.owner?.username
                                                        ?.slice(0, 2)
                                                        .toUpperCase() || "UA"}
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="font-medium text-gray-200">
                                                            {tweet.owner
                                                                ?.name ||
                                                                "Unknown User"}
                                                        </span>
                                                        <span className="text-xs md:text-sm">
                                                            @
                                                            {tweet.owner
                                                                ?.username ||
                                                                "user"}
                                                        </span>
                                                        <span className="text-xs md:text-sm">
                                                            ·
                                                        </span>
                                                        <span className="text-xs md:text-sm">
                                                            <TimeAgo
                                                                datetime={
                                                                    tweet.createdAt
                                                                }
                                                            />
                                                        </span>
                                                    </div>

                                                    <div className="relative group">
                                                        <button className="text-gray-400 hover:text-gray-200">
                                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block border border-gray-700">
                                                            <button
                                                                onClick={() =>
                                                                    startEditing(
                                                                        tweet
                                                                    )
                                                                }
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                                            >
                                                                Edit Tweet
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    deleteTweet(
                                                                        tweet._id
                                                                    )
                                                                }
                                                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                                                            >
                                                                Delete Tweet
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {editingTweetId ===
                                                tweet._id ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) =>
                                                                setEditContent(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full bg-gray-700/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            rows="3"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditSubmit(
                                                                        tweet._id
                                                                    )
                                                                }
                                                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                                                            >
                                                                Save Changes
                                                            </button>
                                                            <button
                                                                onClick={
                                                                    cancelEditing
                                                                }
                                                                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-base md:text-lg break-words whitespace-pre-wrap">
                                                            {tweet.content}
                                                        </p>

                                                        {tweet.image && (
                                                            <div className="mt-3">
                                                                <img
                                                                    src={
                                                                        tweet.image
                                                                    }
                                                                    alt="Tweet media"
                                                                    className="rounded-2xl border border-gray-700 w-full max-h-96 object-cover"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between text-gray-400 mt-3">
                                                            <div className="flex items-center gap-4 md:gap-8">
                                                                <button className="flex items-center gap-1 md:gap-2 hover:text-blue-400 transition-all text-sm md:text-base">
                                                                    <ChatBubbleLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                                                                    <span>
                                                                        {tweet.replies ||
                                                                            0}
                                                                    </span>
                                                                </button>
                                                                <button className="flex items-center gap-1 md:gap-2 hover:text-green-400 transition-all text-sm md:text-base">
                                                                    <ArrowsRightLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                                                                    <span>
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
                                                                    className="flex items-center gap-1 md:gap-2 hover:text-red-400 transition-all text-sm md:text-base"
                                                                >
                                                                    {likedTweets.has(
                                                                        tweet._id
                                                                    ) ? (
                                                                        <HeartSolidIcon className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                                                    ) : (
                                                                        <HeartIcon className="w-4 h-4 md:w-5 md:h-5" />
                                                                    )}
                                                                    <span>
                                                                        {(tweet.likes ||
                                                                            0) +
                                                                            (likedTweets.has(
                                                                                tweet._id
                                                                            )
                                                                                ? 1
                                                                                : 0)}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                            <button className="hover:text-blue-400 transition-all">
                                                                <ArrowUpTrayIcon className="w-4 h-4 md:w-5 md:h-5" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tweet;
