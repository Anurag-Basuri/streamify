/**
 * ThemeToggle Component
 * Premium animated toggle with smooth transitions between light and dark modes
 */
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import useTheme from "../hooks/useTheme";

/**
 * Animated Theme Toggle Button
 * @param {Object} props
 * @param {string} props.variant - 'icon' | 'pill' | 'switch'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.showLabel - Show text label
 * @param {string} props.className - Additional classes
 */
const ThemeToggle = ({
    variant = "switch",
    size = "md",
    showLabel = false,
    className = "",
}) => {
    const { isDark, toggleTheme } = useTheme();

    // Size configurations
    const sizes = {
        sm: { toggle: "w-12 h-6", knob: "w-5 h-5", icon: "w-3 h-3" },
        md: { toggle: "w-14 h-7", knob: "w-6 h-6", icon: "w-3.5 h-3.5" },
        lg: { toggle: "w-16 h-8", knob: "w-7 h-7", icon: "w-4 h-4" },
    };

    const currentSize = sizes[size] || sizes.md;

    // Switch variant - iOS-style toggle
    if (variant === "switch") {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <button
                    onClick={toggleTheme}
                    className={`relative ${currentSize.toggle} rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]`}
                    style={{
                        background: isDark
                            ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                            : "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
                    }}
                    aria-label={
                        isDark ? "Switch to light mode" : "Switch to dark mode"
                    }
                    role="switch"
                    aria-checked={isDark}
                >
                    {/* Background stars/sun rays */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                        <AnimatePresence mode="wait">
                            {isDark ? (
                                <motion.div
                                    key="stars"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0"
                                >
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-white rounded-full"
                                            style={{
                                                top: `${20 + i * 25}%`,
                                                left: `${15 + i * 20}%`,
                                            }}
                                            animate={{
                                                opacity: [0.3, 1, 0.3],
                                                scale: [0.8, 1, 0.8],
                                            }}
                                            transition={{
                                                duration: 2,
                                                delay: i * 0.3,
                                                repeat: Infinity,
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="rays"
                                    initial={{ opacity: 0, rotate: -30 }}
                                    animate={{ opacity: 0.3, rotate: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-start pl-2"
                                >
                                    <div className="w-4 h-4 rounded-full bg-orange-300/50" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Toggle knob */}
                    <motion.div
                        className={`${currentSize.knob} rounded-full shadow-lg flex items-center justify-center relative z-10`}
                        style={{
                            background: isDark
                                ? "linear-gradient(135deg, #475569 0%, #64748b 100%)"
                                : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                        }}
                        animate={{
                            x: isDark ? "100%" : "0%",
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {isDark ? (
                                <motion.svg
                                    key="moon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className={`${currentSize.icon} text-indigo-200`}
                                    initial={{
                                        rotate: -30,
                                        opacity: 0,
                                        scale: 0.5,
                                    }}
                                    animate={{
                                        rotate: 0,
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{
                                        rotate: 30,
                                        opacity: 0,
                                        scale: 0.5,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                                        clipRule="evenodd"
                                    />
                                </motion.svg>
                            ) : (
                                <motion.svg
                                    key="sun"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className={`${currentSize.icon} text-amber-100`}
                                    initial={{
                                        rotate: 30,
                                        opacity: 0,
                                        scale: 0.5,
                                    }}
                                    animate={{
                                        rotate: 0,
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{
                                        rotate: -30,
                                        opacity: 0,
                                        scale: 0.5,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                                </motion.svg>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </button>

                {showLabel && (
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {isDark ? "Dark" : "Light"}
                    </span>
                )}
            </div>
        );
    }

    // Pill variant - Button with background
    if (variant === "pill") {
        return (
            <motion.button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${className}`}
                style={{
                    background: isDark
                        ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                        : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                    boxShadow: isDark
                        ? "0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                        : "0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                }
            >
                <motion.div
                    animate={{ rotate: isDark ? 0 : 360 }}
                    transition={{ duration: 0.5 }}
                >
                    {isDark ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 text-indigo-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 text-amber-500"
                        >
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                        </svg>
                    )}
                </motion.div>
                <span
                    className={`text-sm font-medium ${
                        isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                >
                    {isDark ? "Dark" : "Light"}
                </span>
            </motion.button>
        );
    }

    // Icon variant - Simple icon button
    return (
        <motion.button
            onClick={toggleTheme}
            className={`relative p-2.5 rounded-xl transition-all duration-300 ${className}`}
            style={{
                background: isDark
                    ? "rgba(139, 92, 246, 0.1)"
                    : "rgba(251, 191, 36, 0.1)",
            }}
            whileHover={{
                scale: 1.1,
                background: isDark
                    ? "rgba(139, 92, 246, 0.2)"
                    : "rgba(251, 191, 36, 0.2)",
            }}
            whileTap={{ scale: 0.9 }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative w-6 h-6">
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.svg
                            key="moon-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="absolute inset-0 w-6 h-6 text-indigo-400"
                            initial={{ scale: 0, rotate: -90, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                                clipRule="evenodd"
                            />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="sun-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="absolute inset-0 w-6 h-6 text-amber-500"
                            initial={{ scale: 0, rotate: 90, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
};

ThemeToggle.propTypes = {
    variant: PropTypes.oneOf(["icon", "pill", "switch"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    showLabel: PropTypes.bool,
    className: PropTypes.string,
};

export default ThemeToggle;
