import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useVideo from "../../hooks/useVideo";
import { EmptyState, LoadingState, ErrorState } from "../../components/Video";
import { VideoHeader } from "../../components/Account";
import {
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    XMarkIcon,
    PlayIcon,
    CalendarDaysIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import PropTypes from 'prop-types';

// --- Compact Search Bar ---
const SearchFilterBar = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    total,
    filtered,
}) => (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex-1 relative">
            <input
                type="text"
                className="w-full pl-4 pr-10 py-2 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onSearchChange("")}
                aria-label="Search videos"
            />
            {searchQuery && (
                <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            )}
        </div>
        <select
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort videos"
        >
            <option value="recent">Recently Added</option>
            <option value="popular">Most Viewed</option>
            <option value="oldest">Oldest First</option>
        </select>
        {searchQuery && (
            <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {filtered} of {total} videos
            </div>
        )}
    </div>
);

SearchFilterBar.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    sortBy: PropTypes.string.isRequired,
    onSortChange: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
    filtered: PropTypes.number.isRequired,
};

// --- Compact Edit Modal ---
const EditVideoModal = ({ video, open, onClose, onSave, loading }) => {
    const [form, setForm] = useState({ title: "", description: "", tags: "" });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [err, setErr] = useState({});

    useEffect(() => {
        if (open && video) {
            setForm({
                title: video.title || "",
                description: video.description || "",
                tags: video.tags?.join(", ") || "",
            });
            setThumbnailFile(null);
            setErr({});
        }
    }, [open, video]);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Title required";
        if (form.title.length < 5) e.title = "Min 5 chars";
        if (form.title.length > 100) e.title = "Max 100 chars";
        if (form.description.length > 500) e.description = "Max 500 chars";
        setErr(e);
        return Object.keys(e).length === 0;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.form
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (validate())
                        onSave({
                            ...video,
                            title: form.title.trim(),
                            description: form.description.trim(),
                            tags: form.tags
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            thumbnail: thumbnailFile,
                        });
                }}
            >
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold">Edit Video</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <input
                    className={`w-full px-3 py-2 rounded border ${
                        err.title
                            ? "border-red-400"
                            : "border-gray-300 dark:border-gray-700"
                    } bg-gray-50 dark:bg-gray-800`}
                    value={form.title}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Title"
                    maxLength={100}
                    minLength={5}
                    required
                />
                {err.title && (
                    <div className="text-xs text-red-500">{err.title}</div>
                )}
                <textarea
                    className={`w-full px-3 py-2 rounded border ${
                        err.description
                            ? "border-red-400"
                            : "border-gray-300 dark:border-gray-700"
                    } bg-gray-50 dark:bg-gray-800`}
                    value={form.description}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Description"
                    maxLength={500}
                    rows={3}
                />
                {err.description && (
                    <div className="text-xs text-red-500">
                        {err.description}
                    </div>
                )}
                <input
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    value={form.tags}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder="Tags (comma separated)"
                />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thumbnail
                </label>
                <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                />
                {video.thumbnail && !thumbnailFile && (
                    <img
                        src={video.thumbnail}
                        alt="Current thumbnail"
                        className="w-24 h-14 mt-2 rounded object-cover"
                    />
                )}
                {thumbnailFile && (
                    <div className="mt-2 text-xs text-gray-500">
                        {thumbnailFile.name}
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

// --- Compact Video Card ---
const VideoCard = ({ video, onEdit, onDelete, onTogglePublish, onPlay }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden transition group"
    >
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            {video.thumbnail ? (
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => (e.target.style.display = "none")}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <PlayIcon className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
            )}
            <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 cursor-pointer"
                onClick={() => onPlay(video._id)}
            >
                <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                    <PlayIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
            </div>
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
        <div className="p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100 truncate">
                {video.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {video.description?.slice(0, 60)}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <ChartBarIcon className="w-4 h-4" />
                {video.views || 0}
                <CalendarDaysIcon className="w-4 h-4" />
                {video.createdAt &&
                    new Date(video.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2 mt-2">
                <button
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                    onClick={() => onEdit(video)}
                >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit
                </button>
                <button
                    className={`flex items-center gap-1 ${
                        video.isPublished ? "text-green-600" : "text-gray-400"
                    }`}
                    onClick={() => onTogglePublish(video._id)}
                >
                    {video.isPublished ? (
                        <EyeIcon className="w-4 h-4" />
                    ) : (
                        <EyeSlashIcon className="w-4 h-4" />
                    )}
                    {video.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 ml-auto"
                    onClick={() =>
                        window.confirm("Delete this video?") &&
                        onDelete(video._id)
                    }
                >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    </motion.div>
);

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

    const [editModal, setEditModal] = useState({ open: false, video: null });
    const [editLoading, setEditLoading] = useState(false);
    const searchTimeout = useRef();

    // Local filtering for search (compact)
    const filteredVideos = searchQuery
        ? videos.filter(
              (v) =>
                  v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  v.description
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  v.tags?.some((tag) =>
                      tag.toLowerCase().includes(searchQuery.toLowerCase())
                  )
          )
        : videos;

    useEffect(() => {
        if (!user) {
            navigate("/signin?redirect=/videos");
            return;
        }
        fetchVideos();
        // eslint-disable-next-line
    }, [user]);

    // Only refetch on sort change (search is local)
    useEffect(() => {
        if (!user) return;
        fetchVideos();
        // eslint-disable-next-line
    }, [sortBy]);

    // Debounce search input for local filtering
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {}, 200);
        return () => clearTimeout(searchTimeout.current);
    }, [searchQuery]);

    const handleEditVideo = (video) => setEditModal({ open: true, video });
    const handleSaveVideo = async (updated) => {
        setEditLoading(true);
        await updateVideo(updated._id, {
            title: updated.title,
            description: updated.description,
            tags: updated.tags,
        });
        setEditModal({ open: false, video: null });
        setEditLoading(false);
        toast.success("Video updated!");
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
            <div className="max-w-7xl mx-auto space-y-6">
                <VideoHeader
                    videoCount={videos.length}
                    publishedCount={videos.filter((v) => v.isPublished).length}
                />
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    total={videos.length}
                    filtered={filteredVideos.length}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    onEdit={handleEditVideo}
                                    onDelete={deleteVideo}
                                    onTogglePublish={togglePublish}
                                    onPlay={(id) => navigate(`/watch/${id}`)}
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