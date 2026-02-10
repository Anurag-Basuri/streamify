/**
 * ThemeToggle Component
 * Clean, modular theme toggle with multiple variants
 */
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import useTheme from "../hooks/useTheme";

// ============================================================================
// ICON COMPONENTS - Extracted for reusability and cleaner code
// ============================================================================

const SunIcon = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clipRule="evenodd"
        />
    </svg>
);

SunIcon.propTypes = { className: PropTypes.string };
MoonIcon.propTypes = { className: PropTypes.string };

// ============================================================================
// CONFIGURATION - Centralized size and style configs
// ============================================================================

const SIZES = {
    sm: {
        toggle: "w-11 h-6",
        knob: "w-5 h-5",
        icon: "w-3 h-3",
        iconButton: "p-2",
        pillPadding: "px-3 py-1.5",
    },
    md: {
        toggle: "w-14 h-7",
        knob: "w-6 h-6",
        icon: "w-3.5 h-3.5",
        iconButton: "p-2.5",
        pillPadding: "px-4 py-2",
    },
    lg: {
        toggle: "w-16 h-8",
        knob: "w-7 h-7",
        icon: "w-4 h-4",
        iconButton: "p-3",
        pillPadding: "px-5 py-2.5",
    },
};

const COLORS = {
    light: {
        trackBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        knobBg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        iconColor: "text-amber-100",
        pillBg: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
        pillShadow:
            "0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        iconBtnBg: "rgba(251, 191, 36, 0.15)",
        iconBtnHover: "rgba(251, 191, 36, 0.25)",
    },
    dark: {
        trackBg: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        knobBg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        iconColor: "text-indigo-200",
        pillBg: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        pillShadow:
            "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        iconBtnBg: "rgba(139, 92, 246, 0.15)",
        iconBtnHover: "rgba(139, 92, 246, 0.25)",
    },
};

// ============================================================================
// ANIMATION CONFIGS
// ============================================================================

const iconAnimation = {
    initial: { scale: 0, rotate: -90, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0, rotate: 90, opacity: 0 },
    transition: { duration: 0.2, ease: "easeOut" },
};

const knobSpring = {
    type: "spring",
    stiffness: 500,
    damping: 30,
};

// ============================================================================
// SWITCH VARIANT - iOS-style toggle
// ============================================================================

const SwitchToggle = ({ isDark, toggleTheme, size, showLabel }) => {
    const sizeConfig = SIZES[size];
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDark}
                aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                }
                className={`
                    relative ${sizeConfig.toggle} rounded-full p-0.5
                    transition-all duration-300 ease-out
                    focus:outline-none focus-visible:ring-2 
                    focus-visible:ring-[var(--brand-primary)] 
                    focus-visible:ring-offset-2 
                    focus-visible:ring-offset-[var(--bg-primary)]
                    hover:shadow-lg
                `}
                style={{ background: colors.trackBg }}
            >
                {/* Knob */}
                <motion.div
                    className={`
                        ${sizeConfig.knob} rounded-full shadow-md
                        flex items-center justify-center
                    `}
                    style={{ background: colors.knobBg }}
                    animate={{ x: isDark ? "calc(100% + 2px)" : "0%" }}
                    transition={knobSpring}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isDark ? "moon" : "sun"}
                            {...iconAnimation}
                        >
                            {isDark ? (
                                <MoonIcon
                                    className={`${sizeConfig.icon} ${colors.iconColor}`}
                                />
                            ) : (
                                <SunIcon
                                    className={`${sizeConfig.icon} ${colors.iconColor}`}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </button>

            {showLabel && (
                <span className="text-sm font-medium text-[var(--text-secondary)] select-none">
                    {isDark ? "Dark" : "Light"}
                </span>
            )}
        </div>
    );
};

SwitchToggle.propTypes = {
    isDark: PropTypes.bool.isRequired,
    toggleTheme: PropTypes.func.isRequired,
    size: PropTypes.string.isRequired,
    showLabel: PropTypes.bool,
};

// ============================================================================
// PILL VARIANT - Button with label
// ============================================================================

const PillToggle = ({ isDark, toggleTheme, size }) => {
    const sizeConfig = SIZES[size];
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <motion.button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`
                flex items-center gap-2 ${sizeConfig.pillPadding} rounded-full
                transition-all duration-300 border
                ${isDark ? "border-white/10" : "border-black/5"}
            `}
            style={{
                background: colors.pillBg,
                boxShadow: colors.pillShadow,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <AnimatePresence mode="wait">
                <motion.div key={isDark ? "moon" : "sun"} {...iconAnimation}>
                    {isDark ? (
                        <MoonIcon className="w-4 h-4 text-indigo-400" />
                    ) : (
                        <SunIcon className="w-4 h-4 text-amber-500" />
                    )}
                </motion.div>
            </AnimatePresence>
            <span
                className={`text-sm font-medium ${
                    isDark ? "text-gray-200" : "text-gray-700"
                }`}
            >
                {isDark ? "Dark" : "Light"}
            </span>
        </motion.button>
    );
};

PillToggle.propTypes = {
    isDark: PropTypes.bool.isRequired,
    toggleTheme: PropTypes.func.isRequired,
    size: PropTypes.string.isRequired,
};

// ============================================================================
// ICON VARIANT - Simple icon button
// ============================================================================

const IconToggle = ({ isDark, toggleTheme, size }) => {
    const sizeConfig = SIZES[size];
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <motion.button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`
                relative ${sizeConfig.iconButton} rounded-xl
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 
                focus-visible:ring-[var(--brand-primary)]
            `}
            style={{ background: colors.iconBtnBg }}
            whileHover={{
                scale: 1.1,
                background: colors.iconBtnHover,
            }}
            whileTap={{ scale: 0.9 }}
        >
            <div className="relative w-5 h-5">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isDark ? "moon" : "sun"}
                        className="absolute inset-0 flex items-center justify-center"
                        {...iconAnimation}
                    >
                        {isDark ? (
                            <MoonIcon className="w-5 h-5 text-indigo-400" />
                        ) : (
                            <SunIcon className="w-5 h-5 text-amber-500" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.button>
    );
};

IconToggle.propTypes = {
    isDark: PropTypes.bool.isRequired,
    toggleTheme: PropTypes.func.isRequired,
    size: PropTypes.string.isRequired,
};

// ============================================================================
// MAIN COMPONENT - Delegates to variant components
// ============================================================================

const ThemeToggle = ({
    variant = "switch",
    size = "md",
    showLabel = false,
    className = "",
}) => {
    const { isDark, toggleTheme } = useTheme();
    const validSize = SIZES[size] ? size : "md";

    const variantComponents = {
        switch: (
            <SwitchToggle
                isDark={isDark}
                toggleTheme={toggleTheme}
                size={validSize}
                showLabel={showLabel}
            />
        ),
        pill: (
            <PillToggle
                isDark={isDark}
                toggleTheme={toggleTheme}
                size={validSize}
            />
        ),
        icon: (
            <IconToggle
                isDark={isDark}
                toggleTheme={toggleTheme}
                size={validSize}
            />
        ),
    };

    return (
        <div className={className}>
            {variantComponents[variant] || variantComponents.switch}
        </div>
    );
};

ThemeToggle.propTypes = {
    variant: PropTypes.oneOf(["icon", "pill", "switch"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    showLabel: PropTypes.bool,
    className: PropTypes.string,
};

export default ThemeToggle;

// Named exports for direct usage
export { SunIcon, MoonIcon, SwitchToggle, PillToggle, IconToggle };
