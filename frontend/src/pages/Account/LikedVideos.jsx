/**
 * Liked Videos Page
 * Display all videos the user has liked
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiGrid, FiList } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { api } from "../../services/api";
import { PageTransition, EmptyState } from "../../components/Common";
import VideoCard from "../../components/Video/VideoCard";
import { VideoCardSkeleton } from "../../components/Video/VideoCardSkeleton";
import { showError } from "../../components/Common/ToastProvider";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LikedVideos = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid"); // grid or list

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
            return;
        }
        fetchLikedVideos();
    }, [isAuthenticated, navigate]);

    const fetchLikedVideos = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/v1/likes/videos");
            setVideos(response.data?.data || []);
        } catch (error) {
            showError("Failed to load liked videos");
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoAction = async (action, videoId) => {
        if (action === "unlike") {
            try {
                await api.post(`/api/v1/likes/toggle/v/${videoId}`);
                setVideos(videos.filter((v) => v._id !== videoId));
            } catch (error) {
                showError("Failed to unlike video");
            }
        }
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <FiHeart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                Liked Videos
                            </h1>
                            <p className="text-[var(--text-tertiary)]">
                                {videos.length}{" "}
                                {videos.length === 1 ? "video" : "videos"}
                            </p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] rounded-lg">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === "grid"
                                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                                    : "text-[var(--text-tertiary)]"
                            }`}
                        >
                            <FiGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === "list"
                                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                                    : "text-[var(--text-tertiary)]"
                            }`}
                        >
                            <FiList size={18} />
                        </button>
                    </div>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                                : "space-y-4"
                        }
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <EmptyState
                        preset="noLikedVideos"
                        actionLabel="Browse Videos"
                        action={() => navigate("/")}
                    />
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                                    : "space-y-4"
                            }
                        >
                            {videos.map((video, index) => (
                                <motion.div
                                    key={video._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <VideoCard
                                        video={video}
                                        onAction={handleVideoAction}
                                        isAuthenticated={isAuthenticated}
                                        layout={viewMode}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </PageTransition>
    );
};

export default LikedVideos;
