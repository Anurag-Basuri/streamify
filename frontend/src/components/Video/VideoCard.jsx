import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { FaPlay, FaHeart, FaShare } from "react-icons/fa";
import { formatDistance } from "date-fns";
import { WatchLaterButton } from "./WatchLaterButton";

const VideoInfo = ({ video }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-white truncate">
                {video.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
                <img
                    src={video.owner.avatar}
                    alt={video.owner.username}
                    className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-400">
                    {video.owner.username}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">
                    {video.views} views
                </span>
            </div>
        </div>
    );
};

VideoInfo.propTypes = {
    video: PropTypes.shape({
        title: PropTypes.string.isRequired,
        owner: PropTypes.shape({
            avatar: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
        }).isRequired,
        views: PropTypes.number.isRequired,
    }).isRequired,
};


export const VideoCard = ({
    video,
    onAction,
    inWatchLater,
    watchLaterLoading,
    isAuthenticated,
    progress,
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
        >
            <div className="relative aspect-video">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                />
                <Link
                    to={`/video/${video._id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <FaPlay className="w-12 h-12 text-white" />
                </Link>
                {progress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                            className="h-full bg-purple-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="p-4">
                <VideoInfo video={video} />

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        {formatDistance(new Date(video.createdAt), new Date(), {
                            addSuffix: true,
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <>
                                <WatchLaterButton
                                    inWatchLater={inWatchLater}
                                    loading={watchLaterLoading}
                                    onClick={() =>
                                        onAction("watchlater", video._id)
                                    }
                                />
                                <button
                                    onClick={() => onAction("like", video._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FaHeart
                                        className={`w-5 h-5 ${
                                            video.isLiked ? "text-red-500" : ""
                                        }`}
                                    />
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => onAction("share", video._id)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            <FaShare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

VideoCard.propTypes = {
    video: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        thumbnail: PropTypes.string.isRequired,
        duration: PropTypes.number,
        views: PropTypes.number,
        createdAt: PropTypes.string.isRequired,
        isLiked: PropTypes.bool,
        owner: PropTypes.object.isRequired,
    }).isRequired,
    onAction: PropTypes.func.isRequired,
    inWatchLater: PropTypes.bool,
    watchLaterLoading: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
    progress: PropTypes.number,
};