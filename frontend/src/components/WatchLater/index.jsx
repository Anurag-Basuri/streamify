import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import VideoCard from "../VideoCard";
import LoadingState from "../LoadingState";
import ErrorState from "../ErrorState";
import WatchLaterHeader from "./WatchLaterHeader";
import { EmptyState } from "./EmptyState";
import PropTypes from "prop-types";
import { ErrorBoundary } from "react-error-boundary";

const WatchLater = () => {
    const { user } = useAuth();
    const {
        videos,
        loading,
        error,
        removingVideo,
        setRemovingVideo,
        removeFromWatchLater,
        sortBy,
        setSortBy,
        filter,
        setFilter,
        remindLater,
        setReminder
    } = useWatchLater(user);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

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
                    <WatchLaterHeader 
                        videoCount={videos.length}
                        filter={filter}
                        setFilter={setFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                    
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
                                        onRemove={() => setRemovingVideo(video._id)}
                                        onConfirmRemove={() => removeFromWatchLater(video._id)}
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
        </ErrorBoundary>
    );
};

WatchLater.propTypes = {
    className: PropTypes.string,
    onError: PropTypes.func,
};

export default WatchLater;