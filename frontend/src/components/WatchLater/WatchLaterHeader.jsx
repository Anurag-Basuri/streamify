import { Link } from "react-router-dom";
import { ClockIcon, TrashIcon, PlayIcon, BellIcon } from "@heroicons/react/24/outline";
import { PlayCircleIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import { timeAgo } from "../../utils/dateUtils";
import emptyStateIllustration from "../../resources/watch-later-empty.svg";
import VideoCard from "../../components/VideoCard";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import PropTypes from "prop-types";

const WatchLaterHeader = ({ videoCount, filter, setFilter, sortBy, setSortBy }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <ClockIcon className="w-8 h-8 text-white" />
        </div>
        <div>
            <h1 className="text-4xl font-bold text-gray-900">Watch Later</h1>
            <p className="text-gray-500 mt-1">{videoCount} saved videos</p>
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
        </div>
    </div>
);

WatchLaterHeader.propTypes = {
    videoCount: PropTypes.number.isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    sortBy: PropTypes.string.isRequired,
    setSortBy: PropTypes.func.isRequired,
};

const EmptyState = () => (
    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
        <img
            src={emptyStateIllustration}
            alt="Empty watch later"
            className="w-64 mx-auto mb-8"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Time Capsule Awaits
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
            Save videos you want to watch later and they&apos;ll appear here.
            Curate your perfect viewing experience!
        </p>
        <Link
            to="/videos"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl 
            hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg"
        >
            <PlayCircleIcon className="w-5 h-5" />
            Explore Trending Videos
        </Link>
    </div>
);

const Watchlater = () => {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <WatchLaterHeader 
                    videoCount={videos.length}
                    filter={filter}
                    setFilter={setFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                />
                {/* Content Section */}
                {videos.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Watchlater;