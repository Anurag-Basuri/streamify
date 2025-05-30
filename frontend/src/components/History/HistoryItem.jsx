import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlayCircle, FaTrash } from "react-icons/fa";
import { colors } from "../../utils/theme";

// Import these if not already imported
import { ChannelLink } from "./ChannelLink";
import { VideoMetadata } from "./VideoMetadata";

export const HistoryItem = ({ item, onRemove, formatDuration }) => {
    if (!item?.video) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.cardBg} rounded-xl p-4 border ${colors.accent} shadow-lg hover:shadow-xl transition-all`}
        >
            <div className="flex gap-4">
                <VideoThumbnail
                    video={item.video}
                    formatDuration={formatDuration}
                />
                <VideoDetails item={item} onRemove={onRemove} />
            </div>
        </motion.div>
    );
};

const VideoThumbnail = ({ video, formatDuration }) => {
    const thumbnailUrl = video?.thumbnail?.url || "/default-thumbnail.jpg";
    const videoId = video?._id || "";
    const title = video?.title || "Untitled Video";
    return (
        <div className="relative w-32 aspect-video rounded-lg overflow-hidden">
            <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = "/default-thumbnail.jpg";
                }}
            />
            <div className="absolute bottom-1 right-1 bg-black/80 text-white px-2 py-1 rounded text-xs">
                {formatDuration && typeof video?.duration === "number"
                    ? formatDuration(video.duration)
                    : "--:--"}
            </div>
            <Link
                to={`/video/${videoId}`}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
            >
                <FaPlayCircle className="w-8 h-8 text-white" />
            </Link>
        </div>
    );
};

const VideoDetails = ({ item, onRemove }) => {
    const video = item?.video || {};
    const videoId = video?._id || "";
    const title = video?.title || "Untitled Video";
    return (
        <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between">
                <Link
                    to={`/video/${videoId}`}
                    className="text-lg font-semibold text-gray-100 hover:text-indigo-400 line-clamp-2"
                >
                    {title}
                </Link>
                <button
                    onClick={() => onRemove(videoId)}
                    className="text-gray-400 hover:text-rose-400 p-1"
                >
                    <FaTrash className="w-5 h-5" />
                </button>
            </div>
            {/* Defensive: Only render if owner exists */}
            {video.owner && <ChannelLink owner={video.owner} />}
            <VideoMetadata views={video.views} watchedAt={item.watchedAt} />
        </div>
    );
}

VideoThumbnail.propTypes = {
    video: PropTypes.object.isRequired,
    formatDuration: PropTypes.func.isRequired,
};


VideoDetails.propTypes = {
    item: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
};

HistoryItem.propTypes = {
    item: PropTypes.shape({
        video: PropTypes.shape({
            _id: PropTypes.string,
            title: PropTypes.string,
            thumbnail: PropTypes.shape({
                url: PropTypes.string,
            }),
            duration: PropTypes.number,
            views: PropTypes.number,
            owner: PropTypes.object,
        }),
        watchedAt: PropTypes.string.isRequired,
    }).isRequired,
    onRemove: PropTypes.func.isRequired,
    formatDuration: PropTypes.func.isRequired,
};
