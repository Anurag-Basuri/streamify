/**
 * QuickActions Component
 * Floating action button with quick access to common actions
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiPlus,
    FiX,
    FiUpload,
    FiVideo,
    FiList,
    FiEdit,
    FiMic,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { showInfo } from "./ToastProvider";

// ============================================================================
// QUICK ACTION ITEM
// ============================================================================

const QuickActionItem = ({ icon: Icon, label, onClick, color, delay }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: 20 }}
        transition={{ delay, type: "spring", stiffness: 300 }}
        onClick={onClick}
        className="flex items-center gap-3 group"
    >
        <span className="text-sm font-medium text-white bg-[var(--bg-inverse)] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {label}
        </span>
        <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${color}`}
        >
            <Icon className="w-5 h-5 text-white" />
        </div>
    </motion.button>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuickActions = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!isAuthenticated) return null;

    const actions = [
        {
            icon: FiUpload,
            label: "Upload Video",
            onClick: () => navigate("/create"),
            color: "bg-gradient-to-br from-purple-500 to-indigo-600",
        },
        {
            icon: FiList,
            label: "Create Playlist",
            onClick: () => navigate("/playlist"),
            color: "bg-gradient-to-br from-blue-500 to-cyan-600",
        },
        {
            icon: FiVideo,
            label: "Your Videos",
            onClick: () => navigate("/uservideos"),
            color: "bg-gradient-to-br from-pink-500 to-rose-600",
        },
        {
            icon: FiMic,
            label: "Go Live",
            onClick: () => showInfo("Live streaming coming soon!"),
            color: "bg-gradient-to-br from-red-500 to-orange-600",
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-16 right-0 space-y-3"
                    >
                        {actions.map((action, index) => (
                            <QuickActionItem
                                key={action.label}
                                {...action}
                                delay={index * 0.05}
                                onClick={() => {
                                    action.onClick();
                                    setIsOpen(false);
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                    isOpen
                        ? "bg-[var(--bg-inverse)] text-[var(--text-inverse)]"
                        : "animated-gradient"
                }`}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {isOpen ? (
                        <FiX className="w-6 h-6" />
                    ) : (
                        <FiPlus className="w-6 h-6 text-white" />
                    )}
                </motion.div>
            </motion.button>
        </div>
    );
};

export default QuickActions;
