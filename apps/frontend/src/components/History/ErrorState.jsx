import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

export const ErrorState = ({ error }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8"
    >
        <div className="bg-rose-500/20 p-6 rounded-full mb-6">
            <FaExclamationTriangle className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Something went wrong
        </h2>
        <p className="text-gray-400 max-w-md">
            {error || "Failed to load watch history. Please try again later."}
        </p>
    </motion.div>
);

ErrorState.propTypes = {
    error: PropTypes.string
};