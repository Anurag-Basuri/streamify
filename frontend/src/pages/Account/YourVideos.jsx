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
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

// Search bar with clear and accessibility
const SearchFilterBar = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    options,
}) => (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center w-full md:w-96 bg-white dark:bg-gray-900 rounded-lg shadow px-3 py-2">
            <input
                type="text"
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100"
                placeholder="Search your videos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") onSearchChange("");
                }}
                aria-label="Search videos"
            />
            {searchQuery && (
                <button
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                    tabIndex={0}
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            )}
        </div>
        <select
            className="rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
    </div>
);

// Edit modal for updating video details
const EditVideoModal = ({ video, open, onClose, onSave, loading }) => {
    const [form, setForm] = useState({
        title: video?.title || "",
        description: video?.description || "",
        tags: video?.tags?.join(", ") || "",
    });

    useEffect(() => {
        if (open && video) {
            setForm({
                title: video.title,
                description: video.description,
                tags: video.tags?.join(", ") || "",
            });
        }
    }, [open, video]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-lg"
            >
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Edit Video
                </h2>
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave({
                            ...video,
                            title: form.title,
                            description: form.description,
                            tags: form.tags
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                        });
                    }}
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                        </label>
                        <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 rounded border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            value={form.title}
                            maxLength={100}
                            minLength={5}
                            required
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    title: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            className="w-full mt-1 px-3 py-2 rounded border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            value={form.description}
                            maxLength={500}
                            rows={3}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 rounded border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            value={form.tags}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, tags: e.target.value }))
                            }
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
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

    // Debounce search to avoid excessive API calls
    const searchTimeout = useRef();
    const [editModal, setEditModal] = useState({ open: false, video: null });
    const [editLoading, setEditLoading] = useState(false);

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
    }, [searchQuery, sortBy]);

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
                    options={[
                        { value: "recent", label: "Recently Added" },
                        { value: "popular", label: "Most Viewed" },
                        { value: "oldest", label: "Oldest First" },
                    ]}
                />

                <AnimatePresence mode="popLayout">
                    {videos.length === 0 ? (
                        <EmptyState
                            title="No Videos Yet"
                            description="Start uploading videos to build your collection"
                            actionLabel="Upload Video"
                            onAction={() => navigate("/upload")}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video) => (
                                <motion.div
                                    key={video._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-2 transition-colors"
                                >
                                    <div className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {video.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {video.createdAt &&
                                            new Date(
                                                video.createdAt
                                            ).toLocaleString()}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium px-3 py-1 rounded transition"
                                            onClick={() =>
                                                setEditModal({
                                                    open: true,
                                                    video,
                                                })
                                            }
                                            aria-label="Edit video"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            className={`flex items-center gap-1 font-medium px-3 py-1 rounded transition ${
                                                video.isPublished
                                                    ? "text-green-600 hover:text-green-800"
                                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            }`}
                                            onClick={() =>
                                                togglePublish(video._id)
                                            }
                                            aria-label={
                                                video.isPublished
                                                    ? "Unpublish"
                                                    : "Publish"
                                            }
                                        >
                                            {video.isPublished ? (
                                                <>
                                                    <EyeIcon className="w-4 h-4" />
                                                    Published
                                                </>
                                            ) : (
                                                <>
                                                    <EyeSlashIcon className="w-4 h-4" />
                                                    Unpublished
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded transition"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        "Are you sure you want to delete this video?"
                                                    )
                                                ) {
                                                    deleteVideo(video._id);
                                                }
                                            }}
                                            aria-label="Delete video"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
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
                onSave={async (updated) => {
                    setEditLoading(true);
                    await updateVideo(updated._id, {
                        title: updated.title,
                        description: updated.description,
                        tags: updated.tags,
                    });
                    setEditLoading(false);
                    setEditModal({ open: false, video: null });
                    toast.success("Video updated!");
                }}
            />
        </motion.div>
    );
};

export default YourVideos;
