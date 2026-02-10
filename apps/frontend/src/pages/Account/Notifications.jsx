/**
 * Notifications Page
 * Centralized notification center with filtering, grouping, and infinite scroll
 */
import { useState, useEffect, useCallback, useRef } from "react";
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
    FiRefreshCw,
    FiWifi,
    FiWifiOff,
    FiLoader,
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
    const navigate = useNavigate();
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

    const handleClick = () => {
        if (!notification.read) {
            onMarkRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleClick}
            className={`flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer ${
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
            </div>

            {/* Actions */}
            <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
            >
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
// NOTIFICATION GROUP COMPONENT
// ============================================================================

const NotificationGroup = ({ title, notifications, onMarkRead, onDelete }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 px-4">
                {title}
            </h3>
            <div className="card divide-y divide-[var(--divider)]">
                <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onMarkRead={onMarkRead}
                            onDelete={onDelete}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
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
// CONNECTION STATUS INDICATOR
// ============================================================================

const ConnectionStatus = ({ status }) => {
    const statusConfig = {
        connected: { icon: FiWifi, color: "text-green-500", label: "Live" },
        connecting: {
            icon: FiRefreshCw,
            color: "text-yellow-500",
            label: "Connecting...",
            animate: true,
        },
        disconnected: {
            icon: FiWifiOff,
            color: "text-gray-500",
            label: "Offline",
        },
        error: {
            icon: FiWifiOff,
            color: "text-red-500",
            label: "Connection error",
        },
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 text-xs ${config.color}`}>
            <Icon size={12} className={config.animate ? "animate-spin" : ""} />
            <span>{config.label}</span>
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
        groupedNotifications,
        pagination,
        loadMore,
        connectionStatus,
    } = useNotifications();
    const [filter, setFilter] = useState("all");
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
            return;
        }
        refresh();
    }, [isAuthenticated, navigate, refresh]);

    // Infinite scroll observer
    useEffect(() => {
        if (!pagination.hasNextPage || loading) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore) {
                    setIsLoadingMore(true);
                    await loadMore();
                    setIsLoadingMore(false);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }
        observerRef.current = observer;

        return () => observer.disconnect();
    }, [pagination.hasNextPage, loading, isLoadingMore, loadMore]);

    const handleMarkRead = async (id) => {
        await markRead(id);
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
        showSuccess("All notifications marked as read");
    };

    const handleDelete = async (id) => {
        await removeNotification(id);
    };

    const handleClearAll = async () => {
        if (window.confirm("Clear all notifications? This cannot be undone.")) {
            await clearAll();
            showSuccess("All notifications cleared");
        }
    };

    const handleRefresh = async () => {
        await refresh();
        showSuccess("Notifications refreshed");
    };

    // Filter notifications
    const filterNotifications = (list) => {
        return list.filter((n) => {
            if (filter === "all") return true;
            if (filter === "unread") return !n.read;
            return n.type === filter;
        });
    };

    const counts = {
        all: notifications.length,
        unread: notifications.filter((n) => !n.read).length,
        like: notifications.filter((n) => n.type === "like").length,
        comment: notifications.filter((n) => n.type === "comment").length,
        subscribe: notifications.filter((n) => n.type === "subscribe").length,
    };

    const filteredGrouped = {
        today: filterNotifications(groupedNotifications.today),
        yesterday: filterNotifications(groupedNotifications.yesterday),
        thisWeek: filterNotifications(groupedNotifications.thisWeek),
        older: filterNotifications(groupedNotifications.older),
    };

    const hasNotifications = notifications.length > 0;
    const hasFilteredNotifications = Object.values(filteredGrouped).some(
        (group) => group.length > 0
    );

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
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                    Notifications
                                </h1>
                                <ConnectionStatus status={connectionStatus} />
                            </div>
                            <p className="text-[var(--text-tertiary)]">
                                {counts.unread} unread · {pagination.totalDocs}{" "}
                                total
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="btn btn-ghost p-2"
                            title="Refresh"
                        >
                            <FiRefreshCw
                                size={20}
                                className={loading ? "animate-spin" : ""}
                            />
                        </button>
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

                {/* Notifications List - Grouped */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {loading && notifications.length === 0 ? (
                        <div className="card p-8 space-y-4">
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
                    ) : !hasFilteredNotifications ? (
                        <div className="card">
                            <EmptyState
                                preset="noNotifications"
                                title={
                                    filter === "all"
                                        ? "No notifications"
                                        : `No ${filter} notifications`
                                }
                                description={
                                    filter === "all"
                                        ? "You're all caught up!"
                                        : `You don't have any ${filter} notifications yet.`
                                }
                                size="sm"
                            />
                        </div>
                    ) : (
                        <>
                            <NotificationGroup
                                title="Today"
                                notifications={filteredGrouped.today}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                            />
                            <NotificationGroup
                                title="Yesterday"
                                notifications={filteredGrouped.yesterday}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                            />
                            <NotificationGroup
                                title="This Week"
                                notifications={filteredGrouped.thisWeek}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                            />
                            <NotificationGroup
                                title="Older"
                                notifications={filteredGrouped.older}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                            />

                            {/* Infinite scroll trigger */}
                            {pagination.hasNextPage && (
                                <div
                                    ref={loadMoreRef}
                                    className="flex items-center justify-center py-8"
                                >
                                    {isLoadingMore ? (
                                        <FiLoader
                                            size={24}
                                            className="animate-spin text-[var(--text-tertiary)]"
                                        />
                                    ) : (
                                        <button
                                            onClick={() => loadMore()}
                                            className="text-sm text-[var(--brand-primary)] hover:underline"
                                        >
                                            Load more notifications
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Clear All */}
                {hasNotifications && (
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
