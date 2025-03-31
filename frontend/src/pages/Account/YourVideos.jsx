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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <FilmIcon className="w-8 h-8 text-blue-600" />
                            Your Video Library
                        </h1>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {videos.length} video{videos.length !== 1 && "s"}
                        </span>
                    </div>

                    <Link
                        to="/upload"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Upload New Video
                    </Link>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <svg
                            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="views">Most Views</option>
                    </select>
                </div>

                {/* Content Area */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonLoader key={i} />
                            ))}
                        </div>
                    ) : videos.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-white rounded-xl"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="text-gray-500 text-6xl mb-4">
                                    🎥
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    No videos found
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Start sharing your content with the world
                                </p>
                                <Link
                                    to="/upload"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                    Upload Your First Video
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
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                    >
                                        {/* Thumbnail Section */}
                                        <div className="relative aspect-video group">
                                            <img
                                                src={video.thumbnail?.url}
                                                alt={video.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Quick Actions Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <div className="flex gap-2 w-full">
                                                    <Link
                                                        to={`/edit-video/${video._id}`}
                                                        className="flex-1 flex items-center gap-2 bg-white/90 text-gray-900 px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleTogglePublish(
                                                                video._id
                                                            )
                                                        }
                                                        className="flex items-center gap-2 bg-white/90 text-gray-900 px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                                    >
                                                        {video.isPublished ? (
                                                            <EyeSlashIcon className="w-4 h-4 text-red-600" />
                                                        ) : (
                                                            <EyeIcon className="w-4 h-4 text-green-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Top Badges */}
                                            <div className="absolute top-2 left-2 flex gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-sm ${
                                                        video.isPublished
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {video.isPublished
                                                        ? "Live"
                                                        : "Draft"}
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                                    {Math.floor(
                                                        video.duration / 60
                                                    )}
                                                    :
                                                    {(video.duration % 60)
                                                        .toString()
                                                        .padStart(2, "0")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Video Details */}
                                        <div className="p-4 space-y-3">
                                            <Link
                                                to={`/video/${video._id}`}
                                                className="font-semibold text-lg hover:text-blue-600 line-clamp-2"
                                            >
                                                {video.title}
                                            </Link>

                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <ChartBarIcon className="w-4 h-4" />
                                                    <span>
                                                        {video.views?.toLocaleString()}{" "}
                                                        views
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span>
                                                        {new Date(
                                                            video.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {video.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {video.tags
                                                        .slice(0, 3)
                                                        .map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
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
