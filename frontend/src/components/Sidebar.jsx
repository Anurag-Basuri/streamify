/**
 * Sidebar Component
 * Modern, animated sidebar with collapsible sections and theme integration
 */
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
    Home,
    Bell,
    History,
    Clock,
    User,
    X,
    Settings,
    PlusSquare,
    Film,
    ListVideo,
    DownloadCloud,
    ThumbsUp,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

const NAV_SECTIONS = {
    main: {
        items: [
            { to: "/", icon: Home, label: "Home" },
            { to: "/tweet", icon: ThumbsUp, label: "Tweets" },
            { to: "/subscription", icon: Bell, label: "Subscriptions" },
        ],
    },
    library: {
        title: "Library",
        requiresAuth: true,
        items: [
            { to: "/history", icon: History, label: "History" },
            { to: "/playlist", icon: ListVideo, label: "Playlists" },
            { to: "/watchlater", icon: Clock, label: "Watch Later" },
            { to: "/uservideos", icon: Film, label: "Your Videos" },
            { to: "/downloads", icon: DownloadCloud, label: "Downloads" },
        ],
    },
    account: {
        title: "You",
        items: [
            { to: "/profile", icon: User, label: "Profile" },
            {
                to: "/create",
                icon: PlusSquare,
                label: "Create",
                highlight: true,
            },
            { to: "/settings", icon: Settings, label: "Settings" },
        ],
    },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 72 },
    mobile: { width: "100%" },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

const tooltipVariants = {
    hidden: { opacity: 0, x: -8, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const SectionTitle = ({ title, isOpen }) => (
    <AnimatePresence>
        {isOpen && title && (
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
            >
                {title}
            </motion.h3>
        )}
    </AnimatePresence>
);

SectionTitle.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool,
};

const NavItem = ({ to, icon: Icon, label, isOpen, highlight }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <NavLink
            to={to}
            className={`
                group relative flex items-center gap-3 mx-2 rounded-xl
                transition-all duration-200 ease-out
                ${isOpen ? "px-4 py-2.5" : "px-0 py-2.5 justify-center"}
                ${
                    isActive
                        ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/25"
                        : highlight
                        ? "bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/10 text-[var(--brand-primary)] hover:from-[var(--brand-primary)]/20 hover:to-[var(--brand-secondary)]/20"
                        : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]"
                }
            `}
        >
            {/* Active indicator */}
            {isActive && !isOpen && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-6 bg-[var(--brand-primary)] rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}

            {/* Icon container */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative ${
                    highlight ? "text-[var(--brand-primary)]" : ""
                }`}
            >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {highlight && (
                    <Sparkles
                        size={10}
                        className="absolute -top-1 -right-1 text-[var(--brand-secondary)]"
                    />
                )}
            </motion.div>

            {/* Label */}
            <AnimatePresence>
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium truncate"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Chevron for active state when expanded */}
            {isOpen && isActive && (
                <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-auto"
                >
                    <ChevronRight size={16} />
                </motion.div>
            )}

            {/* Tooltip for collapsed state */}
            {!isOpen && (
                <div className="absolute left-full ml-3 pointer-events-none z-50">
                    <motion.div
                        variants={tooltipVariants}
                        initial="hidden"
                        whileHover="visible"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap
                            bg-[var(--tooltip-bg)] text-[var(--tooltip-text)] shadow-xl
                            opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {label}
                    </motion.div>
                </div>
            )}
        </NavLink>
    );
};

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    highlight: PropTypes.bool,
};

const NavSection = ({ section, isOpen, isAuthenticated }) => {
    if (section.requiresAuth && !isAuthenticated) return null;

    return (
        <div className="mb-2">
            <SectionTitle title={section.title} isOpen={isOpen} />
            <motion.div
                className="space-y-1"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                }}
            >
                {section.items.map((item, index) => (
                    <motion.div
                        key={item.to}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.03 }}
                    >
                        <NavItem {...item} isOpen={isOpen} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

NavSection.propTypes = {
    section: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
    const { isAuthenticated } = useAuth();
    const { isDark } = useTheme();

    const currentVariant =
        isMobile && isOpen ? "mobile" : isOpen ? "expanded" : "collapsed";

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.nav
                variants={sidebarVariants}
                initial={false}
                animate={currentVariant}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                    fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)]
                    bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
                    flex flex-col z-50 lg:z-auto
                    ${
                        isMobile
                            ? isOpen
                                ? "translate-x-0"
                                : "-translate-x-full"
                            : ""
                    }
                    transition-transform lg:transition-none
                `}
                aria-label="Main navigation"
            >
                {/* Mobile close button */}
                {isMobile && (
                    <div className="absolute top-3 right-3 z-10">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleSidebar}
                            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
                                text-[var(--text-secondary)] transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>
                )}

                {/* Navigation sections */}
                <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                    {Object.entries(NAV_SECTIONS).map(([key, section]) => (
                        <NavSection
                            key={key}
                            section={section}
                            isOpen={isOpen}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-[var(--divider)]" />

                {/* Theme toggle footer */}
                <div className="p-3">
                    <div
                        className={`
                        flex items-center rounded-xl p-2
                        ${isOpen ? "justify-between" : "justify-center"}
                        bg-[var(--bg-secondary)]/50
                    `}
                    >
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-medium text-[var(--text-secondary)] pl-2"
                            >
                                {isDark ? "Dark Mode" : "Light Mode"}
                            </motion.span>
                        )}
                        <ThemeToggle
                            variant={isOpen ? "switch" : "icon"}
                            size="sm"
                        />
                    </div>
                </div>
            </motion.nav>
        </>
    );
};

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
};

export default Sidebar;
