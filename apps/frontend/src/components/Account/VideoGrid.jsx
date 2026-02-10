import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import VideoCard from '../Video/VideoCard.jsx';

export const VideoGrid = ({ videos, onDelete, onTogglePublish, onEdit }) => (
    <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
        {videos.map(video => (
            <VideoCard
                key={video._id}
                video={video}
                onDelete={() => onDelete(video._id)}
                onTogglePublish={() => onTogglePublish(video._id)}
                onEdit={() => onEdit(video._id)}
            />
        ))}
    </motion.div>
);

VideoGrid.propTypes = {
    videos: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        thumbnail: PropTypes.string,
        views: PropTypes.number,
        isPublished: PropTypes.bool
    })).isRequired,
    onDelete: PropTypes.func.isRequired,
    onTogglePublish: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
};