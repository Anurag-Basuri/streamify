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
    const [likedTweets, setLikedTweets] = useState(new Set());

    const tweetVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 120, damping: 20 },
        },
        exit: { opacity: 0, x: -50 },
    };

    const fetchTweets = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/v1/tweets");
            setTweets(data.data || []);

            // Initialize liked tweets set
            const liked = new Set();
            data.data.forEach((tweet) => {
                if (tweet.isLiked) {
                    liked.add(tweet._id);
                }
            });
            setLikedTweets(liked);
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
                toast.error("Image size should be less than 5MB");
                return;
            }
            setSelectedImage(file);
        }
    };

    const toggleLike = async (tweetId) => {
        try {
            const isLiked = likedTweets.has(tweetId);

            const { data } = await axios[isLiked ? "delete" : "post"](
                `/api/v1/likes/tweet/${tweetId}`
            );

            setLikedTweets((prev) => {
                const newSet = new Set(prev);
                if (isLiked) {
                    newSet.delete(tweetId); // Remove if already liked
                } else {
                    newSet.add(tweetId); // Add if not liked
                }
                return newSet;
            });

            setTweets((prevTweets) =>
                prevTweets.map((tweet) =>
                    tweet._id === tweetId
                        ? {
                              ...tweet,
                              likes: (tweet.likes || 0) + (isLiked ? -1 : 1),
                              isLiked: !isLiked,
                          }
                        : tweet
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update like");
        }
    };

    const shareTweet = (tweetId) => {
        const tweetUrl = `${window.location.origin}/tweet/${tweetId}`;
        navigator.clipboard.writeText(tweetUrl);
        toast.success("Copied tweet link to clipboard!");
    };

    const charCountColor = useMemo(() => {
        if (newTweet.length > 250) return "text-red-400";
        if (newTweet.length > 200) return "text-yellow-400";
        return "text-gray-400";
    }, [newTweet.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Enhanced Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
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

                {/* Tweet Composition Card */}
                <motion.form
                    onSubmit={handleTweetSubmit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg border border-gray-700/50 space-y-4 hover:border-blue-500/30 transition-all"
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
                                className="w-full bg-transparent resize-none focus:outline-none text-lg md:text-xl placeholder-gray-400 min-h-[100px] md:min-h-[120px] leading-relaxed"
                                rows="3"
                                maxLength={280}
                            />

                            {selectedImage && (
                                <div className="relative group rounded-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                                <div className="flex gap-3 md:gap-4">
                                    <label className="cursor-pointer text-blue-400 hover:text-blue-300 transition-all p-2 rounded-full hover:bg-white/5">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <PhotoIcon className="w-6 h-6" />
                                    </label>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowEmojiPicker(
                                                    !showEmojiPicker
                                                )
                                            }
                                            className="text-blue-400 hover:text-blue-300 transition-all p-2 rounded-full hover:bg-white/5"
                                        >
                                            <FaceSmileIcon className="w-6 h-6" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute z-20 -left-16 md:left-0 bottom-full mb-2">
                                                <EmojiPicker
                                                    onEmojiClick={
                                                        handleEmojiClick
                                                    }
                                                    theme="dark"
                                                    width={300}
                                                    height={400}
                                                    searchDisabled
                                                    skinTonesDisabled
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:gap-4">
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
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        <span className="font-semibold">
                                            Spark
                                        </span>
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl h-32 animate-pulse"
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
                                    <div className="text-6xl">🌌</div>
                                    <p className="text-xl font-medium">
                                        Silent Cosmos...
                                    </p>
                                    <p className="text-gray-500">
                                        Be the first to cast your spark!
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
                                        className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all group relative"
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
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {tweet.owner
                                                            ?.fullName?.[0] ||
                                                            "U"}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tweet Content */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-semibold text-gray-100">
                                                            {tweet.owner
                                                                ?.fullName ||
                                                                "Anonymous Spark"}
                                                        </span>
                                                        <span className="text-sm text-gray-400">
                                                            @
                                                            {tweet.owner
                                                                ?.userName ||
                                                                "unknown"}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            ·
                                                        </span>
                                                        <span className="text-sm text-gray-400">
                                                            <TimeAgo
                                                                datetime={
                                                                    tweet.createdAt
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            shareTweet(
                                                                tweet._id
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-blue-400 transition-all p-1 rounded-full"
                                                    >
                                                        <ShareIcon className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <p className="text-gray-100 text-lg leading-relaxed whitespace-pre-wrap">
                                                    {tweet.content}
                                                </p>

                                                {tweet.image && (
                                                    <div className="mt-3 rounded-xl overflow-hidden">
                                                        <img
                                                            src={tweet.image}
                                                            alt="Tweet content"
                                                            className="w-full h-auto max-h-96 object-contain rounded-xl"
                                                        />
                                                    </div>
                                                )}

                                                {/* Tweet Actions */}
                                                <div className="flex items-center justify-between pt-3">
                                                    <div className="flex items-center gap-6 text-gray-400">
                                                        <button className="flex items-center gap-1 hover:text-blue-400 transition-all">
                                                            <ChatBubbleLeftIcon className="w-5 h-5" />
                                                            <span className="text-sm">
                                                                {tweet.replies ||
                                                                    0}
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
                                                            {likedTweets.has(
                                                                tweet._id
                                                            ) ? (
                                                                <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                            ) : (
                                                                <HeartIcon className="w-5 h-5" />
                                                            )}
                                                            <span className="text-sm">
                                                                {tweet.likes ||
                                                                    0}
                                                            </span>
                                                        </button>
                                                    </div>

                                                    <button className="text-gray-400 hover:text-blue-400 transition-all">
                                                        <ArrowUpTrayIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
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