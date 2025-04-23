import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { FaClock, FaTrash, FaPlayCircle } from "react-icons/fa";
import { GiHourglass } from "react-icons/gi";
import {
    formatDistanceToNow,
    isToday,
    isYesterday,
    subDays,
    format,
} from "date-fns";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

// Updated color palette
const colors = {
    background: "bg-gray-50",
    foreground: "bg-white",
    primary: "text-indigo-700",
    primaryBg: "bg-indigo-700",
    primaryHover: "hover:bg-indigo-800",
    accent: "border-gray-200",
    muted: "text-gray-600",
    destructive: "text-rose-600",
    destructiveBg: "bg-rose-600",
    destructiveHover: "hover:bg-rose-700",
    cardBg: "bg-white",
    cardBorder: "border-gray-200",
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
        <div
            className={`${colors.foreground} rounded-xl p-6 max-w-md w-full shadow-xl ${colors.cardBorder}`}
        >
            <h3 className={`text-xl font-bold mb-2 ${colors.primary}`}>
                {title}
            </h3>
            <p className={`${colors.muted} mb-6`}>{message}</p>
            <div className="flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className={`px-4 py-2 ${colors.muted} hover:${colors.primary} transition-colors rounded-lg`}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 rounded-lg text-white ${
                        danger
                            ? `${colors.destructiveBg} ${colors.destructiveHover}`
                            : `${colors.primaryBg} ${colors.primaryHover}`
                    } transition-colors`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    danger: PropTypes.bool,
};

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

    const groupHistoryByDate = (history) => {
        return history.reduce((acc, item) => {
            const date = new Date(item.watchedAt);
            let group;

            if (isToday(date)) {
                group = "Today";
            } else if (isYesterday(date)) {
                group = "Yesterday";
            } else if (date > subDays(new Date(), 7)) {
                group = "This Week";
            } else {
                group = format(date, "MMMM yyyy");
            }

            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {});
    };

    const formatTime = (date) => {
        return format(new Date(date), "h:mm a");
    };

    const groupedHistory = groupHistoryByDate(history);

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

        return hours > 0
            ? `${hours}:${minutes
                  .toString()
                  .padStart(2, "0")}:${remainingSeconds
                  .toString()
                  .padStart(2, "0")}`
            : `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${colors.background} p-4 md:p-8`}>
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div
                        className={`h-8 ${colors.primaryBg}/20 rounded-full w-48 mb-8`}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`${colors.cardBg} rounded-xl shadow-sm ${colors.cardBorder}`}
                            >
                                <div
                                    className={`aspect-video ${colors.primaryBg}/20 rounded-t-xl`}
                                />
                                <div className="p-4 space-y-3">
                                    <div
                                        className={`h-4 ${colors.primaryBg}/20 rounded-full w-3/4`}
                                    />
                                    <div
                                        className={`h-4 ${colors.primaryBg}/20 rounded-full w-1/2`}
                                    />
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
            <div
                className={`min-h-screen ${colors.background} flex items-center justify-center p-4`}
            >
                <div
                    className={`max-w-md text-center ${colors.destructiveBg}/10 p-8 rounded-2xl shadow-lg ${colors.cardBorder}`}
                >
                    <GiHourglass
                        className={`w-16 h-16 ${colors.destructive} mx-auto mb-4`}
                    />
                    <h2
                        className={`text-2xl font-bold ${colors.destructive} mb-2`}
                    >
                        History Load Failed
                    </h2>
                    <p className={`${colors.destructive} mb-6`}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className={`${colors.destructiveBg} text-white px-6 py-2 rounded-lg ${colors.destructiveHover} transition-colors`}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-screen ${colors.background} flex items-center justify-center p-8`}
            >
                <div className="max-w-2xl text-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative mb-12 mx-auto w-72 h-72"
                    >
                        <div className="absolute inset-0">
                            <div
                                className={`absolute left-1/2 -translate-x-1/2 w-1 h-full ${colors.primaryBg}/20 rounded-full`}
                            />
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
                                        className={`w-8 h-8 ${colors.primaryBg}/10 rounded-full flex items-center justify-center 
                                    border-2 ${colors.primaryBg}/30 shadow-sm`}
                                    >
                                        <FaClock
                                            className={`${colors.primaryBg}/50 w-4 h-4`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
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
                                <div
                                    className={`${colors.cardBg}/5 p-3 rounded-lg shadow-lg transform rotate-3`}
                                >
                                    <div
                                        className={`w-32 h-20 ${colors.primaryBg}/10 rounded-md mb-2`}
                                    />
                                    <div
                                        className={`h-2 ${colors.primaryBg}/10 rounded-full mb-1 w-3/4`}
                                    />
                                    <div
                                        className={`h-2 ${colors.primaryBg}/10 rounded-full w-1/2`}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2
                            className={`text-4xl font-bold ${colors.primary} mb-4`}
                        >
                            Your Time Machine is Empty
                        </h2>
                        <p
                            className={`text-lg ${colors.muted} mb-8 max-w-xl mx-auto`}
                        >
                            Every video you watch becomes part of your personal
                            timeline. Start exploring and let&apos;s build your
                            viewing history together!
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/videos"
                                className={`inline-flex items-center gap-3 ${colors.primaryBg} text-white px-8 py-4 
                                rounded-xl shadow-lg ${colors.primaryHover} transition-all duration-300 
                                text-lg font-medium`}
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen ${colors.background} p-4 md:p-8`}
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div
                            className={`p-3 ${colors.primaryBg} rounded-xl shadow-lg text-white`}
                        >
                            <FaClock className="w-8 h-8" />
                        </div>
                        <div>
                            <h1
                                className={`text-3xl md:text-4xl font-bold ${colors.primary}`}
                            >
                                Viewing History
                            </h1>
                            <p className={`${colors.muted} mt-1`}>
                                {history.length} watched{" "}
                                {history.length === 1 ? "item" : "items"}
                            </p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => setShowClearModal(true)}
                            className={`${colors.destructiveBg}/10 ${colors.destructive} px-4 py-2 rounded-lg hover:${colors.destructiveBg}/20 transition-colors`}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {Object.entries(groupedHistory).map(([group, items]) => (
                    <div key={group} className="mb-12">
                        <div className="flex items-center mb-6">
                            <div
                                className={`h-px ${colors.cardBorder} flex-1`}
                            />
                            <h2
                                className={`mx-4 text-lg md:text-xl font-semibold ${colors.primary} ${colors.foreground} px-4 py-2 rounded-lg shadow-sm ${colors.cardBorder}`}
                            >
                                {group}
                            </h2>
                            <div
                                className={`h-px ${colors.cardBorder} flex-1`}
                            />
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item.video._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`group relative flex flex-col md:flex-row gap-4 items-start p-4 rounded-xl hover:${colors.primaryBg}/5 transition-colors ${colors.cardBorder} ${colors.cardBg} shadow-sm hover:shadow-md`}
                                >
                                    <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden">
                                        <img
                                            src={item.video.thumbnail?.url}
                                            alt={item.video.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <Link
                                            to={`/video/${item.video._id}`}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                                        >
                                            <FaPlayCircle className="w-12 h-12 text-white/90 hover:text-white transition-colors" />
                                        </Link>
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                                            {formatDuration(
                                                item.video.duration
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex justify-between items-start gap-4">
                                            <Link
                                                to={`/video/${item.video._id}`}
                                                className={`text-lg font-semibold ${colors.primary} hover:underline line-clamp-2`}
                                            >
                                                {item.video.title}
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    setRemovingId(
                                                        item.video._id
                                                    )
                                                }
                                                className={`${colors.muted} hover:${colors.destructive} p-1 transition-colors`}
                                            >
                                                <FaTrash className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <Link
                                            to={`/channel/${item.video.owner?._id}`}
                                            className="flex items-center gap-3 mt-3"
                                        >
                                            <img
                                                src={item.video.owner?.avatar}
                                                alt={item.video.owner?.userName}
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                            />
                                            <span
                                                className={`text-sm font-medium ${colors.primary} hover:underline`}
                                            >
                                                {item.video.owner?.userName}
                                            </span>
                                        </Link>

                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                            <span
                                                className={`${colors.muted} bg-gray-100 px-2 py-1 rounded-md`}
                                            >
                                                {item.video.views} views
                                            </span>
                                            <span
                                                className={`${colors.muted} bg-gray-100 px-2 py-1 rounded-md`}
                                            >
                                                {formatTime(item.watchedAt)}
                                            </span>
                                            <span
                                                className={`${colors.muted} bg-gray-100 px-2 py-1 rounded-md`}
                                            >
                                                {formatDistanceToNow(
                                                    new Date(item.watchedAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
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
                    </div>
                ))}

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