import PropTypes from "prop-types";
import { FaEye, FaClock } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export const VideoMetadata = ({ views, watchedAt }) => (
    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
        {typeof views === "number" && (
            <span className="flex items-center gap-1">
                <FaEye className="inline-block" /> {views} views
            </span>
        )}
        {watchedAt && (
            <span className="flex items-center gap-1">
                <FaClock className="inline-block" />
                Watched {formatDistanceToNow(new Date(watchedAt), { addSuffix: true })}
            </span>
        )}
    </div>
);

VideoMetadata.propTypes = {
    views: PropTypes.number,
    watchedAt: PropTypes.string,
};