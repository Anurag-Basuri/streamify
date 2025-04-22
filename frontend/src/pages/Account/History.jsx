import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { FaClock, FaTrash, FaPlayCircle } from "react-icons/fa";
import { GiHourglass } from "react-icons/gi";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const History = () => {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch("/api/v1/history", {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok)
                    throw new Error(data.message || "Couldn't fetch history");
                setHistory(data.data?.videos || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchHistory();
    }, [user]);

    const handleRemove = async (videoId) => {
        try {
            const response = await fetch(`/api/v1/history/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to remove from history");
            setHistory((prev) =>
                prev.filter((item) => item.video._id !== videoId)
            );
            setRemovingId(null);
        } catch (err) {
            setError(err.message);
            setRemovingId(null);
        }
    };

    const handleClearAll = async () => {
        try {
            const response = await fetch("/api/v1/history/clear", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to clear history");
            setHistory([]);
            setShowClearModal(false);
        } catch (err) {
            setError(err.message);
            setShowClearModal(false);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes
                .toString()
                .padStart(2, "0")}:${remainingSeconds
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const ConfirmModal = ({
        title,
        message,
        onCancel,
        onConfirm,
        confirmText = "Confirm",
        danger = false,
    }) => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg ${
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-purple-600 hover:bg-purple-700"
                        } text-white transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    if (history.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8"
            >
                <div className="max-w-2xl text-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative mb-12 mx-auto w-72 h-72"
                    >
                        {/* Animated timeline illustration */}
                        <div className="absolute inset-0">
                            {/* Main timeline line */}
                            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-purple-200 rounded-full" />

                            {/* Floating time markers */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                    }}
                                    className="absolute left-1/2 -translate-x-1/2"
                                    style={{ top: `${20 + i * 15}%` }}
                                >
                                    <div
                                        className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center 
                                    border-2 border-purple-300 shadow-sm"
                                    >
                                        <FaClock className="text-purple-500 w-4 h-4" />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Floating video card */}
                            <motion.div
                                initial={{ y: 0, scale: 0 }}
                                animate={{
                                    y: [-20, 20, -20],
                                    scale: 1,
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute left-1/2 -translate-x-1/2 top-1/2"
                            >
                                <div className="bg-white p-3 rounded-lg shadow-lg transform rotate-3">
                                    <div className="w-32 h-20 bg-purple-100 rounded-md mb-2" />
                                    <div className="h-2 bg-purple-100 rounded-full mb-1 w-3/4" />
                                    <div className="h-2 bg-purple-100 rounded-full w-1/2" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Your Time Machine is Empty
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                            Every video you watch becomes part of your personal
                            timeline. Start exploring and let's build your
                            viewing history together!
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/videos"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-500 
                                text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all 
                                duration-300 text-lg font-medium"
                            >
                                <FaPlayCircle className="w-6 h-6" />
                                Begin Your Journey
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    ConfirmModal.propTypes = {
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        onCancel: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
        confirmText: PropTypes.string,
        danger: PropTypes.bool,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-full w-48 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl shadow-lg"
                            >
                                <div className="aspect-video bg-gray-200 rounded-t-xl"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center bg-red-50 p-8 rounded-2xl shadow-lg">
                    <GiHourglass className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">
                        History Load Failed
                    </h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                            <FaClock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Viewing History
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {history.length} watched{" "}
                                {history.length === 1 ? "item" : "items"}
                            </p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => setShowClearModal(true)}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 bg-white rounded-2xl shadow-sm"
                    >
                        <div className="w-64 h-64 mx-auto mb-8 relative">
                            <div className="absolute inset-0 bg-purple-100 rounded-full animate-pulse" />
                            <div
                                className="absolute inset-4 bg-purple-200 rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                            />
                            <div
                                className="absolute inset-8 bg-purple-300 rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                            />
                            <FaClock className="absolute inset-0 m-auto text-6xl text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Your History is Empty
                        </h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Videos you watch will appear here. Start exploring
                            and build your viewing history!
                        </p>
                        <Link
                            to="/videos"
                            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl 
                            hover:bg-purple-700 transition-all transform hover:-translate-y-1 shadow-lg"
                        >
                            <FaPlayCircle className="w-5 h-5" />
                            Start Watching
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => (
                            <motion.div
                                key={item.video._id}
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all 
                                duration-300 transform hover:-translate-y-2 group relative"
                            >
                                <div className="relative aspect-video rounded-t-xl overflow-hidden">
                                    <img
                                        src={item.video.thumbnail?.url}
                                        alt={item.video.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 
                                        transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                                            {formatDuration(
                                                item.video.duration
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/video/${item.video._id}`}
                                        className="absolute inset-0 flex items-center justify-center opacity-0 
                                        group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaPlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                                    </Link>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Link
                                            to={`/video/${item.video._id}`}
                                            className="font-bold text-gray-900 hover:text-purple-600 line-clamp-2 
                                            text-lg leading-tight"
                                        >
                                            {item.video.title}
                                        </Link>
                                        <button
                                            onClick={() =>
                                                setRemovingId(item.video._id)
                                            }
                                            className="text-gray-400 hover:text-red-600 p-1 -mt-1 -mr-1 
                                            transition-colors"
                                            aria-label="Remove from history"
                                        >
                                            <FaTrash className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mt-3">
                                        <Link
                                            to={`/channel/${item.video.owner?._id}`}
                                            className="flex items-center gap-2 group shrink-0"
                                        >
                                            <img
                                                src={item.video.owner?.avatar}
                                                alt={item.video.owner?.userName}
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                            />
                                        </Link>
                                        <div className="min-w-0">
                                            <Link
                                                to={`/channel/${item.video.owner?._id}`}
                                                className="text-sm font-medium text-gray-900 truncate 
                                                hover:text-purple-600"
                                            >
                                                {item.video.owner?.userName}
                                            </Link>
                                            <p className="text-sm text-gray-500 truncate">
                                                {item.video.views} views •{" "}
                                                {formatDistanceToNow(
                                                    new Date(item.watchedAt),
                                                    { addSuffix: true }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {removingId === item.video._id && (
                                    <ConfirmModal
                                        title="Remove from History?"
                                        message="This action will remove this video from your watch history."
                                        onCancel={() => setRemovingId(null)}
                                        onConfirm={() =>
                                            handleRemove(item.video._id)
                                        }
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {showClearModal && (
                    <ConfirmModal
                        title="Clear All History?"
                        message="This will permanently remove all items from your watch history."
                        onCancel={() => setShowClearModal(false)}
                        onConfirm={handleClearAll}
                        confirmText="Clear All"
                        danger
                    />
                )}
            </div>
        </motion.div>
    );
};

export default History;
