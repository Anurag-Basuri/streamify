/**
 * VideoGridSection Component
 * Responsive video grid with adaptive columns and CSS variables
 */
import { motion } from "framer-motion";
import PropTypes from "prop-types";

export const VideoGridSection = ({
    videoGridContent,
    hasMore,
    loadingMore,
}) => (
    <motion.section
        layout
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        {videoGridContent}

        {loadingMore && hasMore && (
            <div className="col-span-full flex justify-center py-6 sm:py-8">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        )}
    </motion.section>
);

VideoGridSection.propTypes = {
    videoGridContent: PropTypes.node.isRequired,
    hasMore: PropTypes.bool,
    loadingMore: PropTypes.bool,
};

export default VideoGridSection;
