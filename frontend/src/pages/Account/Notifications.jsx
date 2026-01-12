/**
 * Notifications Page
 * Centralized notification center with filtering and actions
 */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiTrash2,
    FiFilter,
    FiHeart,
    FiMessageCircle,
    FiUserPlus,
    FiVideo,
    FiSettings,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { PageTransition, EmptyState } from "../../components/Common";
import { showSuccess, showError } from "../../components/Common/ToastProvider";
import { useNotifications } from "../../context/NotificationContext";
import { formatRelativeTime } from "../../utils";

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const icons = {
        like: { icon: FiHeart, color: "text-pink-500", bg: "bg-pink-500/10" },
        comment: {
            icon: FiMessageCircle,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        subscribe: {
            icon: FiUserPlus,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        upload: {
            icon: FiVideo,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        system: { icon: FiBell, color: "text-gray-500", bg: "bg-gray-500/10" },
    };

    const { icon: Icon, color, bg } = icons[notification.type] || icons.system;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                notification.read
                    ? "bg-transparent hover:bg-[var(--bg-secondary)]"
                    : "bg-[var(--brand-primary-light)]"
            }`}
        >
            {/* Icon */}
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
            >
                <Icon className={`w-5 h-5 ${color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm ${
                        notification.read
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-primary)] font-medium"
                    }`}
                >
                    {notification.message}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {formatRelativeTime(notification.createdAt)}
                </p>
                {notification.link && (
                    <Link
                        to={notification.link}
                        className="inline-block text-sm text-[var(--brand-primary)] hover:underline mt-2"
                    >
                        View details →
                    </Link>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {!notification.read && (
                    <button
                        onClick={() => onMarkRead(notification._id)}
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                        title="Mark as read"
                    >
                        <FiCheck
                            size={16}
                            className="text-[var(--text-tertiary)]"
                        />
                    </button>
                )}
                <button
                    onClick={() => onDelete(notification._id)}
                    className="p-2 hover:bg-[var(--error-light)] rounded-lg transition-colors group"
                    title="Delete"
                >
                    <FiTrash2
                        size={16}
                        className="text-[var(--text-tertiary)] group-hover:text-[var(--error)]"
                    />
                </button>
            </div>
        </motion.div>
    );
};

// ============================================================================
// FILTER TABS
// ============================================================================

const FilterTabs = ({ active, onChange, counts }) => {
    const filters = [
        { id: "all", label: "All", count: counts.all },
        { id: "unread", label: "Unread", count: counts.unread },
        { id: "like", label: "Likes", count: counts.like },
        { id: "comment", label: "Comments", count: counts.comment },
        { id: "subscribe", label: "Subscribers", count: counts.subscribe },
    ];

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onChange(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        active === filter.id
                            ? "bg-[var(--brand-primary)] text-white"
                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                >
                    {filter.label}
                    {filter.count > 0 && (
                        <span
                            className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                                active === filter.id
                                    ? "bg-white/20"
                                    : "bg-[var(--bg-tertiary)]"
                            }`}
                        >
                            {filter.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Notifications = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const {
        notifications,
        loading,
        refresh,
        markRead,
        markAllRead,
        removeNotification,
        clearAll,
    } = useNotifications();
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
            return;
        }
        refresh();
    }, [isAuthenticated, navigate, refresh]);

    const handleMarkRead = async (id) => {
        await markRead(id);
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
    };

    const handleDelete = async (id) => {
        await removeNotification(id);
    };

    const handleClearAll = async () => {
        if (window.confirm("Clear all notifications?")) {
            await clearAll();
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter;
    });

    const counts = {
        all: notifications.length,
        unread: notifications.filter((n) => !n.read).length,
        like: notifications.filter((n) => n.type === "like").length,
        comment: notifications.filter((n) => n.type === "comment").length,
        subscribe: notifications.filter((n) => n.type === "subscribe").length,
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <FiBell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                Notifications
                            </h1>
                            <p className="text-[var(--text-tertiary)]">
                                {counts.unread} unread
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {counts.unread > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="btn btn-secondary text-sm"
                            >
                                <FiCheckCircle className="mr-2" />
                                Mark all read
                            </button>
                        )}
                        <Link to="/settings" className="btn btn-ghost p-2">
                            <FiSettings size={20} />
                        </Link>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <FilterTabs
                        active={filter}
                        onChange={setFilter}
                        counts={counts}
                    />
                </motion.div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card divide-y divide-[var(--divider)]"
                >
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 skeleton rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 skeleton rounded w-3/4" />
                                        <div className="h-3 skeleton rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <EmptyState
                            preset="noNotifications"
                            title={
                                filter === "all"
                                    ? "No notifications"
                                    : `No ${filter} notifications`
                            }
                            description="You're all caught up!"
                            size="sm"
                        />
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onMarkRead={handleMarkRead}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </motion.div>

                {/* Clear All */}
                {notifications.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 text-center"
                    >
                        <button
                            onClick={handleClearAll}
                            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors"
                        >
                            Clear all notifications
                        </button>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};

export default Notifications;
