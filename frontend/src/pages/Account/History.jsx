import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { FaClock, FaTrash, FaPlayCircle } from "react-icons/fa";
import { GiHourglass } from "react-icons/gi";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const ConfirmModal = ({
    title,
    message,
    onCancel,
    onConfirm,
    confirmText = "Confirm",
    danger = false,
}) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-background rounded-xl p-6 max-w-md w-full border border-accent">
            <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
            <p className="text-muted mb-6">{message}</p>
            <div className="flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-muted hover:text-primary transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 rounded-lg ${
                        danger
                            ? "bg-destructive hover:bg-destructive-hover"
                            : "bg-primary hover:bg-primary-hover"
                    } text-white transition-colors`}
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
            const response = await fetch(`/api/v1/history/remove/${videoId}`, {
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
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="h-8 bg-muted/20 rounded-full w-48 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-foreground/5 rounded-xl shadow-lg"
                            >
                                <div className="aspect-video bg-muted/20 rounded-t-xl" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-muted/20 rounded-full w-3/4" />
                                    <div className="h-4 bg-muted/20 rounded-full w-1/2" />
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
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md text-center bg-destructive/10 p-8 rounded-2xl shadow-lg border border-destructive/20">
                    <GiHourglass className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-destructive mb-2">
                        History Load Failed
                    </h2>
                    <p className="text-destructive mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-destructive text-white px-6 py-2 rounded-lg hover:bg-destructive-hover transition-colors"
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
            className="min-h-screen bg-background p-8"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary rounded-xl shadow-lg">
                            <FaClock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-primary">
                                Viewing History
                            </h1>
                            <p className="text-muted mt-1">
                                {history.length} watched{" "}
                                {history.length === 1 ? "item" : "items"}
                            </p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => setShowClearModal(true)}
                            className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 bg-foreground/5 rounded-2xl shadow-sm"
                    >
                        <div className="w-64 h-64 mx-auto mb-8 relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 border-4 border-primary/10 rounded-full"
                            />
                            <div className="absolute inset-8 flex items-center justify-center">
                                <FaClock className="text-6xl text-primary/50" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-primary mb-4">
                            Your History is Empty
                        </h2>
                        <p className="text-muted max-w-md mx-auto mb-8">
                            Videos you watch will appear here. Start exploring
                            and build your viewing history!
                        </p>
                        <Link
                            to="/videos"
                            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl 
                            hover:bg-primary-hover transition-all transform hover:-translate-y-1 shadow-lg"
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
                                className="bg-foreground/5 rounded-xl shadow-lg hover:shadow-2xl transition-all 
                                duration-300 transform hover:-translate-y-2 group relative border border-accent/20"
                            >
                                <div className="relative aspect-video rounded-t-xl overflow-hidden">
                                    <img
                                        src={item.video.thumbnail?.url}
                                        alt={item.video.title}
                                        loading="lazy"
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
                                            className="font-bold text-primary hover:text-primary-hover line-clamp-2 
                                            text-lg leading-tight"
                                        >
                                            {item.video.title}
                                        </Link>
                                        <button
                                            onClick={() =>
                                                setRemovingId(item.video._id)
                                            }
                                            className="text-muted hover:text-destructive p-1 -mt-1 -mr-1 
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
                                                className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                                            />
                                        </Link>
                                        <div className="min-w-0">
                                            <Link
                                                to={`/channel/${item.video.owner?._id}`}
                                                className="text-sm font-medium text-primary truncate 
                                                hover:text-primary-hover"
                                            >
                                                {item.video.owner?.userName}
                                            </Link>
                                            <p className="text-sm text-muted truncate">
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