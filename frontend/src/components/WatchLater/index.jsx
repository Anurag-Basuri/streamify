import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater.js";
import VideoCard from "../Video/VideoCard.jsx";
import LoadingState from "../Video/LoadingState.jsx";
import ErrorState from "../Video/ErrorState.jsx";
import WatchLaterHeader from "./WatchLaterHeader.jsx";
import { EmptyState } from "./EmptyState.jsx";
import PropTypes from "prop-types";
import { ErrorBoundary } from "react-error-boundary";

const WatchLater = () => {
    const { user } = useAuth();
    const {
        videos,
        loading,
        error,
        clearError,
        removingVideo,
        setRemovingVideo,
        removeFromWatchLater,
        sortBy,
        setSortBy,
        filter,
        setFilter,
        remindLater,
        setReminder,
        refresh,
    } = useWatchLater(user);

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
        <ErrorBoundary
            FallbackComponent={({ error }) => (
                <ErrorState error={error.message} />
            )}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <WatchLaterHeader
                            videoCount={videos.length}
                            filter={filter}
                            setFilter={setFilter}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />
                        <button
                            onClick={refresh}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                            aria-label="Refresh"
                        >
                            Refresh
                        </button>
                    </div>
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
                                            setRemovingVideo(video._id)
                                        }
                                        onConfirmRemove={() =>
                                            removeFromWatchLater(video._id)
                                        }
                                        onRemindLater={() =>
                                            setReminder(video._id)
                                        }
                                        isRemoving={removingVideo === video._id}
                                        hasReminder={remindLater[video._id]}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

WatchLater.propTypes = {
    className: PropTypes.string,
    onError: PropTypes.func,
};

export default WatchLater;