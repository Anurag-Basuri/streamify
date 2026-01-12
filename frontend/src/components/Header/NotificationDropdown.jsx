/**
 * NotificationDropdown Component
 * Dropdown menu showing recent notifications in the header
 */
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCheck,
    Heart,
    MessageCircle,
    UserPlus,
    Video,
    Settings,
    ExternalLink,
} from "lucide-react";
import PropTypes from "prop-types";
import { useNotifications } from "../../context/NotificationContext";
import { formatRelativeTime } from "../../utils";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
};

// ============================================================================
// NOTIFICATION ICONS
// ============================================================================

const notificationIcons = {
    like: { icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
    comment: {
        icon: MessageCircle,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    subscribe: {
        icon: UserPlus,
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    upload: { icon: Video, color: "text-purple-500", bg: "bg-purple-500/10" },
    system: { icon: Bell, color: "text-gray-500", bg: "bg-gray-500/10" },
};

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

const NotificationItem = ({ notification, onMarkRead, onClose }) => {
    const navigate = useNavigate();
    const {
        icon: Icon,
        color,
        bg,
    } = notificationIcons[notification.type] || notificationIcons.system;

    const handleClick = () => {
        if (!notification.read) {
            onMarkRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            onClick={handleClick}
            className={`flex items-start gap-3 p-3 cursor-pointer transition-colors rounded-lg mx-1 ${
                notification.read
                    ? "hover:bg-[var(--bg-secondary)]"
                    : "bg-[var(--brand-primary-light)] hover:bg-[var(--brand-primary-light)]/80"
            }`}
        >
            {/* Icon */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
            >
                <Icon className={`w-4 h-4 ${color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm line-clamp-2 ${
                        notification.read
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-primary)] font-medium"
                    }`}
                >
                    {notification.message}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {formatRelativeTime(notification.createdAt)}
                </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] flex-shrink-0 mt-2" />
            )}
        </motion.div>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.object.isRequired,
    onMarkRead: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NotificationDropdown = ({ className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const {
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
        connectionStatus,
    } = useNotifications();

    // Get only recent notifications (max 5)
    const recentNotifications = notifications.slice(0, 5);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen]);

    const handleViewAll = () => {
        setIsOpen(false);
        navigate("/notifications");
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative p-2.5 rounded-xl
                    bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    transition-colors duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]
                `}
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <Bell size={20} strokeWidth={2} />

                {/* Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.span>
                )}

                {/* Connection indicator */}
                {connectionStatus === "connected" && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[var(--bg-secondary)]" />
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--divider)]">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--brand-primary)] text-white rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck
                                            size={16}
                                            className="text-[var(--text-tertiary)]"
                                        />
                                    </button>
                                )}
                                <Link
                                    to="/settings"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                    title="Notification settings"
                                >
                                    <Settings
                                        size={16}
                                        className="text-[var(--text-tertiary)]"
                                    />
                                </Link>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[360px] overflow-y-auto scrollbar-thin py-1">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 skeleton rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 skeleton rounded w-3/4" />
                                                <div className="h-2 skeleton rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentNotifications.length === 0 ? (
                                <div className="py-12 px-4 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                        <Bell
                                            size={24}
                                            className="text-[var(--text-tertiary)]"
                                        />
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        No notifications yet
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                        We&apos;ll notify you when something
                                        happens
                                    </p>
                                </div>
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                            },
                                        },
                                    }}
                                >
                                    {recentNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onMarkRead={markRead}
                                            onClose={() => setIsOpen(false)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-[var(--divider)]">
                                <button
                                    onClick={handleViewAll}
                                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    View all notifications
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

NotificationDropdown.propTypes = {
    className: PropTypes.string,
};

export default NotificationDropdown;
