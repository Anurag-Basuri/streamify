import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FilmIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ClockIcon,
    ChartBarIcon,
    PlusCircleIcon,
    EllipsisVerticalIcon,
    ArrowPathIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const YourVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const { user } = useContext(AuthContext);

    // Fetch videos with filters
    const fetchVideos = async () => {
        try {
            const response = await fetch(
                `/api/v1/videos/user/${user?._id}?sort=${sortBy}&search=${searchQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            const data = await response.json();
            console.log(data);
            if (!response.ok)
                throw new Error(data.message || "Failed to fetch videos");
            setVideos(data.data?.videos || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchVideos();
    }, [user, sortBy, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    // Handle delete video
    const handleDelete = async (videoId) => {
        const confirm = window.confirm(
            "Are you sure you want to delete this video?"
        );
        if (!confirm) return;

        const deleteToast = toast.loading("Deleting video...");

        try {
            const response = await fetch(`/api/v1/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` },
            });

            if (!response.ok) throw new Error("Delete failed");

            setVideos((prev) => prev.filter((video) => video._id !== videoId));
            toast.success("Video deleted successfully", { id: deleteToast });
        } catch (err) {
            toast.error(err.message || "Failed to delete video", {
                id: deleteToast,
            });
        }
    };

    // Handle toggle publish status
    const handleTogglePublish = async (videoId) => {
        const action = videos.find((v) => v._id === videoId)?.isPublished
            ? "unpublishing"
            : "publishing";
        const publishToast = toast.loading(`${action} video...`);

        try {
            const response = await fetch(`/api/v1/videos/${videoId}/publish`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            if (!response.ok) throw new Error("Status update failed");

            const data = await response.json();
            setVideos((prev) =>
                prev.map((v) =>
                    v._id === videoId
                        ? { ...v, isPublished: !v.isPublished }
                        : v
                )
            );

            toast.success(
                `Video ${data.data.isPublished ? "published" : "unpublished"}`,
                {
                    id: publishToast,
                    icon: data.data.isPublished ? "🎥" : "📁",
                }
            );
        } catch (err) {
            toast.error(err.message || "Update failed", { id: publishToast });
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300 },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.2 },
        },
    };

    // Skeleton loader
    const SkeletonLoader = () => (
        <div className="animate-pulse bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-100 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Enhanced Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <FilmIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Video Studio
                            </h1>
                            <p className="text-gray-600">
                                {videos.length} video
                                {videos.length !== 1 && "s"} •{" "}
                                {videos.filter((v) => v.isPublished).length}{" "}
                                published
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/create"
                        className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                        <span className="font-semibold">New Video</span>
                    </Link>
                </motion.div>

                {/* Enhanced Controls Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4"
                >
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SparklesIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                        />
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="views">Most Views</option>
                        </select>
                    </div>
                </motion.div>

                {/* Enhanced Content Area */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonLoader key={i} />
                            ))}
                        </div>
                    ) : videos.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="text-blue-500 text-6xl mb-4">
                                    🎥
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Ready to Create?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Your video library is empty. Start sharing
                                    your story with the world!
                                </p>
                                <Link
                                    to="/upload"
                                    className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                    Upload First Video
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            <AnimatePresence>
                                {videos.map((video) => (
                                    <motion.div
                                        key={video._id}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        layout
                                        className="group relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                                    >
                                        {/* Enhanced Thumbnail Section */}
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={video.thumbnail?.url}
                                                alt={video.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Enhanced Action Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                                                {/* Top Badges */}
                                                <div className="flex justify-between items-start">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            video.isPublished
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {video.isPublished
                                                            ? "PUBLISHED"
                                                            : "DRAFT"}
                                                    </span>
                                                    <span className="bg-black/80 text-white px-2 py-1 rounded text-sm">
                                                        {Math.floor(
                                                            video.duration / 60
                                                        )}
                                                        :
                                                        {(video.duration % 60)
                                                            .toString()
                                                            .padStart(2, "0")}
                                                    </span>
                                                </div>

                                                {/* Bottom Actions */}
                                                <div className="flex gap-2 w-full">
                                                    <Link
                                                        to={`/edit-video/${video._id}`}
                                                        className="flex-1 flex items-center justify-center gap-2 bg-white/90 text-gray-900 px-4 py-2 rounded-lg hover:bg-white transition-all"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Edit Video {video._id}
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleTogglePublish(
                                                                video._id
                                                            )
                                                        }
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                                                    >
                                                        {video.isPublished ? (
                                                            <EyeSlashIcon className="w-5 h-5 text-red-600" />
                                                        ) : (
                                                            <EyeIcon className="w-5 h-5 text-green-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Video Details */}
                                        <div className="p-4 space-y-3">
                                            <Link
                                                to={`/video/${video._id}`}
                                                className="block font-semibold text-lg text-gray-900 hover:text-blue-600 line-clamp-2"
                                            >
                                                {video.title}
                                            </Link>

                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <ChartBarIcon className="w-4 h-4" />
                                                    <span>
                                                        {video.views?.toLocaleString()}{" "}
                                                        views
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span>
                                                        {new Date(
                                                            video.createdAt
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {video.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {video.tags
                                                        .slice(0, 3)
                                                        .map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-default"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default YourVideos;
