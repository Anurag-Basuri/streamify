import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
        <motion.div
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

LoadingState.propTypes = {
    error: PropTypes.string,
    onRetry: PropTypes.func,
};

export default LoadingState;