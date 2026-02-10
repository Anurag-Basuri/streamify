import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";

export const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8"
    >
        <div className="bg-indigo-400/20 p-6 rounded-full mb-6">
            <FaHistory className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
            No Watch History
        </h2>
        <p className="text-gray-400 max-w-md mb-8">
            Videos you watch will appear here. Start exploring some videos to build your history.
        </p>
        <Link
            to="/videos"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl transition-colors"
        >
            Explore Videos
        </Link>
    </motion.div>
);