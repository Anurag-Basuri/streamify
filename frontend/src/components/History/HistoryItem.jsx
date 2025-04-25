import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlayCircle, FaTrash, FaEye } from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";
import { colors } from "../../utils/theme";

export const HistoryItem = ({ item, onRemove, formatDuration }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${colors.cardBg} rounded-xl p-4 border ${colors.accent} shadow-lg hover:shadow-xl transition-all`}
    >
        <div className="flex gap-4">
            <VideoThumbnail video={item.video} formatDuration={formatDuration} />
            <VideoDetails item={item} onRemove={onRemove} />
        </div>
    </motion.div>
);

const VideoThumbnail = ({ video, formatDuration }) => (
    <div className="relative w-32 aspect-video rounded-lg overflow-hidden">
        <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover"
        />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white px-2 py-1 rounded text-xs">
            {formatDuration(video.duration)}
        </div>
        <Link
            to={`/video/${video._id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
        >
            <FaPlayCircle className="w-8 h-8 text-white" />
        </Link>
    </div>
);

const VideoDetails = ({ item, onRemove }) => (
    <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between">
            <Link
                to={`/video/${item.video._id}`}
                className="text-lg font-semibold text-gray-100 hover:text-indigo-400 line-clamp-2"
            >
                {item.video.title}
            </Link>
            <button
                onClick={() => onRemove(item.video._id)}
                className="text-gray-400 hover:text-rose-400 p-1"
            >
                <FaTrash className="w-5 h-5" />
            </button>
        </div>

        <ChannelLink owner={item.video.owner} />
        <VideoMetadata views={item.video.views} watchedAt={item.watchedAt} />
    </div>
);

HistoryItem.propTypes = {
    item: PropTypes.shape({
        video: PropTypes.object.isRequired,
        watchedAt: PropTypes.string.isRequired
    }).isRequired,
    onRemove: PropTypes.func.isRequired,
    formatDuration: PropTypes.func.isRequired
};