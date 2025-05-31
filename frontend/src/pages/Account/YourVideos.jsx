import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useVideo from "../../hooks/useVideo";
import { EmptyState, LoadingState, ErrorState } from "../../components/Video";
import { VideoHeader, VideoGrid } from "../../components/Account";
import {
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    XMarkIcon,
    PlayIcon,
    ClockIcon,
    CalendarDaysIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

// Enhanced Search bar with filters
const SearchFilterBar = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    options,
    totalVideos,
    filteredCount,
}) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Search your videos by title, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") onSearchChange("");
                        }}
                        aria-label="Search videos"
                    />
                    {searchQuery && (
                        <button
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <select
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[150px]"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    aria-label="Sort videos"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {searchQuery && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {filteredCount} of {totalVideos} videos
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Enhanced Edit modal
const EditVideoModal = ({ video, open, onClose, onSave, loading }) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        tags: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open && video) {
            setForm({
                title: video.title || "",
                description: video.description || "",
                tags: video.tags?.join(", ") || "",
            });
            setErrors({});
        }
    }, [open, video]);

    const validateForm = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (form.title.length < 5)
            newErrors.title = "Title must be at least 5 characters";
        if (form.title.length > 100)
            newErrors.title = "Title must be less than 100 characters";
        if (form.description.length > 500)
            newErrors.description =
                "Description must be less than 500 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        onSave({
            ...video,
            title: form.title.trim(),
            description: form.description.trim(),
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Edit Video Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border ${
                                errors.title
                                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200`}
                            value={form.title}
                            onChange={(e) => {
                                setForm((f) => ({
                                    ...f,
                                    title: e.target.value,
                                }));
                                if (errors.title)
                                    setErrors((e) => ({ ...e, title: null }));
                            }}
                            placeholder="Enter video title..."
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.title}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {form.title.length}/100 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            className={`w-full px-4 py-3 rounded-xl border ${
                                errors.description
                                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200`}
                            value={form.description}
                            rows={4}
                            onChange={(e) => {
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }));
                                if (errors.description)
                                    setErrors((e) => ({
                                        ...e,
                                        description: null,
                                    }));
                            }}
                            placeholder="Describe your video..."
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.description}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {form.description.length}/500 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={form.tags}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, tags: e.target.value }))
                            }
                            placeholder="tech, tutorial, javascript (comma separated)"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Separate tags with commas
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// Enhanced Video Card Component
const VideoCard = ({ video, onEdit, onDelete, onTogglePublish, onPlay }) => {
    const [imageError, setImageError] = useState(false);

    const formatDuration = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatViews = (views) => {
        if (!views) return "0 views";
        if (views < 1000) return `${views} views`;
        if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
        return `${(views / 1000000).toFixed(1)}M views`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 group"
        >
            {/* Thumbnail Section */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {video.thumbnail && !imageError ? (
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                        <PlayIcon className="w-16 h-16 text-blue-500 dark:text-blue-400 opacity-50" />
                    </div>
                )}

                {/* Play Button Overlay */}
                <div
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                    onClick={() => onPlay(video._id)}
                >
                    <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-200">
                        <PlayIcon className="w-8 h-8 text-gray-900 dark:text-white" />
                    </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                    </div>
                )}

                {/* Status Badge */}
                <div
                    className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                        video.isPublished
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                >
                    {video.isPublished ? "Published" : "Draft"}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="mb-4">
                    <h3
                        className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                        onClick={() => onPlay(video._id)}
                        title={video.title}
                    >
                        {video.title}
                    </h3>

                    {video.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {video.description}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        <ChartBarIcon className="w-4 h-4" />
                        {formatViews(video.views)}
                    </div>
                    <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        {formatDate(video.createdAt)}
                    </div>
                </div>

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {video.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                        {video.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                                +{video.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => onEdit(video)}
                        aria-label="Edit video"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit
                    </button>

                    <button
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            video.isPublished
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => onTogglePublish(video._id)}
                        aria-label={video.isPublished ? "Unpublish" : "Publish"}
                    >
                        {video.isPublished ? (
                            <>
                                <EyeIcon className="w-4 h-4" />
                                Published
                            </>
                        ) : (
                            <>
                                <EyeSlashIcon className="w-4 h-4" />
                                Publish
                            </>
                        )}
                    </button>

                    <button
                        className="flex items-center gap-1 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium ml-auto"
                        onClick={() => {
                            if (
                                window.confirm(
                                    "Are you sure you want to delete this video? This action cannot be undone."
                                )
                            ) {
                                onDelete(video._id);
                            }
                        }}
                        aria-label="Delete video"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const YourVideos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        videos,
        loading,
        error,
        fetchVideos,
        updateVideo,
        deleteVideo,
        togglePublish,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
    } = useVideo(user);

    const searchTimeout = useRef();
    const [editModal, setEditModal] = useState({ open: false, video: null });
    const [editLoading, setEditLoading] = useState(false);

    // Filter videos based on search query
    const filteredVideos = videos.filter((video) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            video.title?.toLowerCase().includes(query) ||
            video.description?.toLowerCase().includes(query) ||
            video.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
    });

    useEffect(() => {
        if (!user) {
            navigate("/signin?redirect=/videos");
            return;
        }
        fetchVideos();
        // eslint-disable-next-line
    }, [user]);

    useEffect(() => {
        if (!user) return;
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchVideos();
        }, 400);
        return () => clearTimeout(searchTimeout.current);
        // eslint-disable-next-line
    }, [sortBy]);

    const handlePlayVideo = (videoId) => {
        // Navigate to video player - you can update this route as needed
        navigate(`/watch/${videoId}`);
    };

    const handleEditVideo = (video) => {
        setEditModal({ open: true, video });
    };

    const handleSaveVideo = async (updatedVideo) => {
        setEditLoading(true);
        try {
            await updateVideo(updatedVideo._id, {
                title: updatedVideo.title,
                description: updatedVideo.description,
                tags: updatedVideo.tags,
            });
            setEditModal({ open: false, video: null });
            toast.success("Video updated successfully!");
        } catch (error) {
            toast.error("Failed to update video");
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={fetchVideos} />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                <VideoHeader
                    videoCount={videos.length}
                    publishedCount={videos.filter((v) => v.isPublished).length}
                />

                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    totalVideos={videos.length}
                    filteredCount={filteredVideos.length}
                    options={[
                        { value: "recent", label: "Recently Added" },
                        { value: "popular", label: "Most Viewed" },
                        { value: "oldest", label: "Oldest First" },
                    ]}
                />

                <AnimatePresence mode="popLayout">
                    {filteredVideos.length === 0 ? (
                        <EmptyState
                            title={
                                searchQuery
                                    ? "No videos found"
                                    : "No Videos Yet"
                            }
                            description={
                                searchQuery
                                    ? "Try adjusting your search terms or clear the search to see all videos"
                                    : "Start uploading videos to build your collection"
                            }
                            actionLabel={
                                searchQuery ? "Clear Search" : "Upload Video"
                            }
                            onAction={() =>
                                searchQuery
                                    ? setSearchQuery("")
                                    : navigate("/upload")
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredVideos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    onEdit={handleEditVideo}
                                    onDelete={deleteVideo}
                                    onTogglePublish={togglePublish}
                                    onPlay={handlePlayVideo}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <EditVideoModal
                video={editModal.video}
                open={editModal.open}
                loading={editLoading}
                onClose={() => setEditModal({ open: false, video: null })}
                onSave={handleSaveVideo}
            />
        </motion.div>
    );
};

export default YourVideos;