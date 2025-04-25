import { motion } from "framer-motion";

export const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
        <motion.div
            className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
    </div>
);