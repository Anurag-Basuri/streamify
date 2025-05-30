import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import PropTypes from "prop-types";

const VideoCard = ({
    video,
    onRemove,
    onRemindLater,
    isRemoving,
    hasReminder,
}) => (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
        <div className="font-bold">{video.title}</div>
        <div className="text-xs text-gray-500">
            {video.addedAt && new Date(video.addedAt).toLocaleString()}
        </div>
        <button
            className="text-red-500"
            onClick={onRemove}
            disabled={isRemoving}
        >
            {isRemoving ? "Removing..." : "Remove"}
        </button>
        <button
            className="text-blue-500"
            onClick={onRemindLater}
            disabled={hasReminder}
        >
            {hasReminder ? "Reminder Set" : "Remind Me"}
        </button>
    </div>
);

VideoCard.propTypes = {
    video: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onRemindLater: PropTypes.func.isRequired,
    isRemoving: PropTypes.bool.isRequired,
    hasReminder: PropTypes.bool.isRequired,
};

const LoadingState = () => <div className="text-center py-12">Loading...</div>;
const ErrorState = ({ error, onRetry }) => (
    <div className="text-center py-12 text-red-500">
        {error}
        {onRetry && (
            <button className="ml-4 underline" onClick={onRetry}>
                Retry
            </button>
        )}
    </div>
);

ErrorState.propTypes = {
    error: PropTypes.string.isRequired,
    onRetry: PropTypes.func,
};

const EmptyState = () => (
    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
        <svg
            className="w-32 mx-auto mb-8 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 64 64"
        >
            <circle cx="32" cy="32" r="30" stroke="currentColor" />
            <path
                d="M20 32h24M32 20v24"
                stroke="currentColor"
                strokeLinecap="round"
            />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Time Capsule Awaits
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
            Save videos you want to watch later and they&apos;ll appear here.
            Curate your perfect viewing experience!
        </p>
        <a
            href="/videos"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl 
            hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg"
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.118v7.764a1 1 0 001.234.97l6.518-1.757A1 1 0 0016 14.882V9.118a1 1 0 00-1.248-.95z"
                />
            </svg>
            Explore Trending Videos
        </a>
    </div>
);

const WatchLaterPage = () => {
    const { user } = useAuth();
    const {
        videos,
        loading,
        error,
        clearError,
        removingVideo,
        removeFromWatchLater,
        clearWatchLater,
        sortBy,
        setSortBy,
        filter,
        setFilter,
        remindLater,
        setReminder,
        refresh,
    } = useWatchLater(user);

    // UI
    if (!user)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Please log in to view your Watch Later list.
            </div>
        );
    if (loading) return <LoadingState />;
    if (error)
        return (
            <ErrorState
                error={error}
                onRetry={() => {
                    clearError();
                    refresh();
                }}
            />
        );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                        {/* Clock icon SVG */}
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Watch Later
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {videos.length} saved video
                            {videos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <select
                            className="rounded-lg px-2 py-1 border text-gray-700"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="today">Added Today</option>
                            <option value="week">This Week</option>
                        </select>
                        <select
                            className="rounded-lg px-2 py-1 border text-gray-700"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="recent">Recently Added</option>
                        </select>
                        <button
                            onClick={refresh}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                            aria-label="Refresh"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={clearWatchLater}
                            className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                            aria-label="Clear All"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
                {/* Content */}
                <AnimatePresence mode="wait">
                    {videos.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <EmptyState />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {videos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    onRemove={() =>
                                        removeFromWatchLater(video._id)
                                    }
                                    onRemindLater={() => setReminder(video._id)}
                                    isRemoving={removingVideo === video._id}
                                    hasReminder={remindLater[video._id]}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

WatchLaterPage.propTypes = {
    className: PropTypes.string,
    onError: PropTypes.func,
};

export default WatchLaterPage;
