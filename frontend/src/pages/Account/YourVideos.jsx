import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
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
    SparklesIcon,
    ArrowsUpDownIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const YourVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch videos with filters
    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/v1/videos/user/${user?._id}?sort=${sortBy}&search=${searchQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch videos");
            }
            setVideos(data.data?.videos || []);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchVideos();
    }, [user, sortBy, searchQuery]);

    // Handle delete with confirmation and proper state updates
    const handleDelete = async (videoId) => {
        const deleteToast = toast.loading("Processing...");
        try {
            console.log("Deleting video with ID:", videoId);

            // API call for soft delete
            const response = await fetch(`/api/v1/videos/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Delete failed");
            }

            // Refresh data from server instead of optimistic update
            await fetchVideos();

            toast.success("Video moved to trash", {
                id: deleteToast,
                icon: "🗑️",
                position: "bottom-right",
            });
        } catch (err) {
            toast.error(err.message || "Delete failed", {
                id: deleteToast,
                position: "bottom-right",
            });
        }
    };

    // Toggle publish status with server sync
    const handleTogglePublish = async (videoId) => {
        const toastId = toast.loading("Updating status...", {
            position: "bottom-right",
        });
        try {
            const response = await fetch(`/api/v1/videos/${videoId}/publish`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            if (!response.ok) throw new Error("Update failed");

            // Refresh data from server
            await fetchVideos();

            const data = await response.json();
            toast.success(
                `Video ${data.data.isPublished ? "published" : "unpublished"}`,
                {
                    id: toastId,
                    icon: data.data.isPublished ? "📢" : "🔒",
                    position: "bottom-right",
                }
            );
        } catch (err) {
            toast.error(err.message || "Update failed", {
                id: toastId,
                position: "bottom-right",
            });
        }
    };

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 20 },
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-blue-100 animate-pulse" />
                        <FilmIcon className="w-8 h-8 text-blue-600 absolute top-4 left-4" />
                    </div>
                    <p className="text-gray-600 font-medium">
                        Loading your video library...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-4">
                    <div className="text-red-500 text-center">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">
                            Error Loading Videos
                        </h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchVideos}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100/80 rounded-xl shadow-inner">
                            <FilmIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Video Dashboard
                            </h1>
                            <p className="text-gray-600">
                                {videos.length} video
                                {videos.length !== 1 && "s"} •
                                <span className="text-green-600 ml-1">
                                    {videos.filter((v) => v.isPublished).length}{" "}
                                    published
                                </span>
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/create"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                        <span>New Video</span>
                    </Link>
                </motion.div>

                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-4"
                >
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SparklesIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 appearance-none"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="views">Most Views</option>
                        </select>
                    </div>
                </motion.div>

                {/* Content Area */}
                <AnimatePresence mode="popLayout">
                    {videos.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm p-12 text-center"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="text-6xl mb-4">🎬</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Your Studio Awaits
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    No videos found. Ready to create your first
                                    masterpiece?
                                </p>
                                <Link
                                    to="/create"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                    Upload Video
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence>
                                {videos.map((video) => (
                                    <motion.div
                                        key={video._id}
                                        layoutId={video._id}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        whileHover={{ y: -5 }}
                                        className="group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-all"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={video.thumbnail?.url}
                                                alt={video.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Status Badges */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        video.isPublished
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {video.isPublished
                                                        ? "LIVE"
                                                        : "DRAFT"}
                                                </span>
                                                <span className="bg-black/80 text-white px-2 py-1 rounded-full text-xs">
                                                    {Math.floor(
                                                        video.duration / 60
                                                    )}
                                                    :
                                                    {(video.duration % 60)
                                                        .toString()
                                                        .padStart(2, "0")}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <div className="flex gap-3 w-full">
                                                    <Link
                                                        to={`/edit-video/${video._id}`}
                                                        className="flex-1 flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-all"
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
                                                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                                                    >
                                                        {video.isPublished ? (
                                                            <EyeSlashIcon className="w-5 h-5 text-red-600" />
                                                        ) : (
                                                            <EyeIcon className="w-5 h-5 text-green-600" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                video._id
                                                            )
                                                        }
                                                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors text-red-600"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video Info */}
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-bold text-gray-900 line-clamp-2">
                                                {video.title}
                                            </h3>

                                            <div className="flex justify-between text-sm text-gray-600">
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
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
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