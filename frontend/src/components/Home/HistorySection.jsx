import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { VideoCard } from "../Video/VideoCard.jsx";

export const HistorySection = ({
    history,
    onAction,
    inWatchLater,
    watchLaterLoading,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
        >
            <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>
            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                    {history.map((item) => (
                        <div
                            key={item._id}
                            className="flex-none w-80 snap-start"
                        >
                            <VideoCard
                                video={item.video}
                                onAction={onAction}
                                inWatchLater={inWatchLater(item.video._id)}
                                watchLaterLoading={watchLaterLoading}
                                progress={item.progress}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

HistorySection.propTypes = {
    history: PropTypes.array.isRequired,
    onAction: PropTypes.func.isRequired,
    inWatchLater: PropTypes.func.isRequired,
    watchLaterLoading: PropTypes.bool,
};