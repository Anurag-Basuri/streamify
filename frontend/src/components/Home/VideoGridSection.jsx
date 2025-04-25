import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export const VideoGridSection = ({
    videoGridContent,
    hasMore,
    loadingMore,
}) => (
    <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
        {videoGridContent}
        {loadingMore && hasMore && (
            <div className="col-span-full flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )}
    </motion.div>
);

VideoGridSection.propTypes = {
    videoGridContent: PropTypes.node.isRequired,
    hasMore: PropTypes.bool,
    loadingMore: PropTypes.bool,
};