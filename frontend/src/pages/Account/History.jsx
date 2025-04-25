import { useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { FaClock, FaTrash, FaPlayCircle, FaEye } from "react-icons/fa";
import { GiHourglass } from "react-icons/gi";
import { ConfirmModal } from "../../components/Modal";
import useHistory from "../../hooks/useHistory";
import { colors } from "../../utils/theme";

const History = () => {
    const { user } = useContext(AuthContext);
    const {
        history,
        loading,
        error,
        removingId,
        showClearModal,
        setRemovingId,
        setShowClearModal,
        removeFromHistory,
        clearHistory,
        groupHistoryByDate,
    } = useHistory(user);

    const formatTime = (date) => format(new Date(date), "h:mm a");

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
                <div className="max-w-7xl mx-auto animate-pulse space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-400/20 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-8 bg-indigo-400/20 rounded-full w-48" />
                            <div className="h-4 bg-indigo-400/20 rounded-full w-32" />
                        </div>
                    </div>
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-48 aspect-video bg-indigo-400/20 rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-indigo-400/20 rounded-full w-3/4" />
                                    <div className="h-4 bg-indigo-400/20 rounded-full w-1/2" />
                                    <div className="h-4 bg-indigo-400/20 rounded-full w-32" />
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
                <div className="text-center max-w-md bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl border border-rose-400/30">
                    <GiHourglass className="w-16 h-16 text-rose-400 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-rose-400 mb-2">
                        History Load Failed
                    </h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-rose-500/90 hover:bg-rose-400 text-white px-6 py-2.5 rounded-xl transition-colors"
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
                <div className="text-center max-w-2xl">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="relative mb-12 mx-auto w-72 h-72"
                    >
                        <div className="absolute inset-0 border-4 border-indigo-400/10 rounded-full" />
                        <div className="absolute inset-8 flex items-center justify-center">
                            <FaClock className="text-6xl text-indigo-400/30 animate-pulse" />
                        </div>
                    </motion.div>

                    <h2 className="text-4xl font-bold text-indigo-400 mb-4">
                        Time Capsule Awaits
                    </h2>
                    <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                        Your viewing journey starts here. Watch videos to create
                        your personal timeline!
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/videos"
                            className="inline-flex items-center gap-3 bg-indigo-500/90 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-lg font-medium"
                        >
                            <FaPlayCircle className="w-6 h-6" />
                            Start Watching
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    const groupedHistory = groupHistoryByDate(history);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen ${colors.background} p-4 md:p-8`}
        >
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-400/20 rounded-xl">
                            <FaClock className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-indigo-400">
                                Viewing History
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {history.length} watched items
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="bg-rose-500/90 hover:bg-rose-400 text-white px-4 py-2.5 rounded-xl transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                {Object.entries(groupedHistory).map(([group, items]) => (
                    <div key={group} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-indigo-400/20" />
                            <span className="text-xl font-semibold text-indigo-400 px-4 py-2 bg-indigo-400/10 rounded-xl">
                                {group}
                            </span>
                            <div className="flex-1 h-px bg-indigo-400/20" />
                        </div>

                        <div className="grid gap-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item.video._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${colors.cardBg} rounded-xl p-4 border ${colors.accent} shadow-lg hover:shadow-xl transition-all`}
                                >
                                    <div className="flex gap-4">
                                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden">
                                            <img
                                                src={item.video.thumbnail?.url}
                                                alt={item.video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white px-2 py-1 rounded text-xs">
                                                {formatDuration(
                                                    item.video.duration
                                                )}
                                            </div>
                                            <Link
                                                to={`/video/${item.video._id}`}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                                            >
                                                <FaPlayCircle className="w-8 h-8 text-white" />
                                            </Link>
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <Link
                                                    to={`/video/${item.video._id}`}
                                                    className="text-lg font-semibold text-gray-100 hover:text-indigo-400 line-clamp-2"
                                                >
                                                    {item.video.title}
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        setRemovingId(
                                                            item.video._id
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-rose-400 p-1"
                                                >
                                                    <FaTrash className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <Link
                                                to={`/channel/${item.video.owner?._id}`}
                                                className="flex items-center gap-2 group"
                                            >
                                                <img
                                                    src={
                                                        item.video.owner?.avatar
                                                    }
                                                    alt={
                                                        item.video.owner
                                                            ?.userName
                                                    }
                                                    className="w-6 h-6 rounded-full border border-indigo-400/30"
                                                />
                                                <span className="text-sm text-indigo-400 hover:text-indigo-300">
                                                    {item.video.owner?.userName}
                                                </span>
                                            </Link>

                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <FaEye className="w-4 h-4" />
                                                    {item.video.views}
                                                </span>
                                                <span className="opacity-50">
                                                    •
                                                </span>
                                                <span>
                                                    {formatTime(item.watchedAt)}
                                                </span>
                                                <span className="opacity-50">
                                                    •
                                                </span>
                                                <span>
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            item.watchedAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {removingId === item.video._id && (
                                        <ConfirmModal
                                            title="Remove from History?"
                                            message="This action will remove this video from your watch history."
                                            onCancel={() => setRemovingId(null)}
                                            onConfirm={() =>
                                                removeFromHistory(
                                                    item.video._id
                                                )
                                            }
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showClearModal && (
                <ConfirmModal
                    title="Clear All History?"
                    message="This will permanently remove all items from your watch history."
                    onCancel={() => setShowClearModal(false)}
                    onConfirm={clearHistory}
                    confirmText="Clear All"
                    danger
                />
            )}
        </motion.div>
    );
};

export default History;
