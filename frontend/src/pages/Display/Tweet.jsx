import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    SparklesIcon,
    PencilIcon,
    ArrowPathIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

const Tweet = () => {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState("");
    const [loading, setLoading] = useState(true);

    // Animation variants
    const tweetVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 120, damping: 20 },
        },
        exit: { opacity: 0, x: -50 },
    };

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const { data } = await axios.get("/api/v1/tweets");
                setTweets(data.tweets);
            } catch (err) {
                toast.error("Failed to fetch latest tweets");
            } finally {
                setLoading(false);
            }
        };
        fetchTweets();
    }, []);

    const handleTweetSubmit = async (e) => {
        e.preventDefault();
        if (!newTweet.trim()) return;

        try {
            const { data } = await axios.post("/api/v1/tweets/create", {
                content: newTweet,
            });

            setTweets([data.tweet, ...tweets]);
            setNewTweet("");
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl shadow-xl"
                >
                    <div className="flex items-center gap-4">
                        <SparklesIcon className="w-12 h-12 text-yellow-400" />
                        <div>
                            <h1 className="text-4xl font-bold">Global Feed</h1>
                            <p className="text-gray-200 mt-2">
                                Share your thoughts with the world
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tweet Form */}
                <motion.form
                    onSubmit={handleTweetSubmit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700"
                >
                    <div className="flex gap-4">
                        <div className="pt-1">
                            <PencilIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newTweet}
                                onChange={(e) => setNewTweet(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full bg-transparent resize-none focus:outline-none text-lg"
                                rows="3"
                                maxLength={280}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <span
                                    className={`text-sm ${
                                        newTweet.length > 250
                                            ? "text-red-400"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {280 - newTweet.length}
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newTweet.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Post Tweet
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.form>

                {/* Tweets List */}
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl animate-pulse h-32"
                            />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {tweets?.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-gray-400"
                                >
                                    <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4" />
                                    Be the first to share something amazing!
                                </motion.div>
                            ) : (
                                tweets?.map((tweet) => (
                                    <motion.div
                                        key={tweet._id}
                                        variants={tweetVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all"
                                    >
                                        <div className="flex gap-4">
                                            <div className="bg-blue-600/20 p-2 rounded-lg">
                                                <ChatBubbleLeftIcon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg mb-2">
                                                    {tweet.content}
                                                </p>
                                                <div className="flex items-center gap-4 text-gray-400 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <ArrowPathIcon className="w-4 h-4" />
                                                        {new Date(
                                                            tweet.createdAt
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </span>
                                                    <span>
                                                        @
                                                        {tweet.owner
                                                            ?.username ||
                                                            "user"}
                                                    </span>
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
