/**
 * Subscriptions Page
 * Display all channels the user is subscribed to
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiBell,
    FiGrid,
    FiList,
    FiRefreshCw,
    FiUserMinus,
    FiUser,
    FiVideo,
    FiUsers,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { PageTransition, EmptyState } from "../../components/Common";
import { showError, showSuccess } from "../../components/Common/ToastProvider";
import { getUserSubscriptions, toggleSubscription } from "../../services";
import { formatRelativeTime, formatCount } from "../../utils";

// ============================================================================
// CHANNEL CARD COMPONENT
// ============================================================================

const ChannelCard = ({ channel, onUnsubscribe, viewMode = "grid" }) => {
    const navigate = useNavigate();
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);

    const handleUnsubscribe = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsUnsubscribing(true);
        try {
            await onUnsubscribe(channel._id);
        } finally {
            setIsUnsubscribing(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/channel/${channel.userName || channel._id}`);
    };

    // List view layout
    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleCardClick}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)] cursor-pointer transition-all group"
            >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {channel.avatar ? (
                        <img
                            src={channel.avatar}
                            alt={channel.userName}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[var(--brand-primary)] transition-all"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                                {channel.userName?.charAt(0)?.toUpperCase() ||
                                    "?"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                        {channel.fullName || channel.userName}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                        @{channel.userName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-1">
                        <span className="flex items-center gap-1">
                            <FiUsers size={12} />
                            {formatCount(channel.subscribersCount || 0)}{" "}
                            subscribers
                        </span>
                        <span className="flex items-center gap-1">
                            <FiVideo size={12} />
                            {formatCount(channel.videosCount || 0)} videos
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handleUnsubscribe}
                        disabled={isUnsubscribing}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-colors text-sm font-medium"
                    >
                        {isUnsubscribing ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <FiUserMinus size={16} />
                                <span className="hidden sm:inline">
                                    Unsubscribe
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        );
    }

    // Grid view layout (default)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleCardClick}
            className="group cursor-pointer"
        >
            <div className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--brand-primary)] transition-all shadow-sm hover:shadow-lg p-4 sm:p-5 text-center">
                {/* Avatar */}
                <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-3">
                    {channel.avatar ? (
                        <img
                            src={channel.avatar}
                            alt={channel.userName}
                            className="w-full h-full rounded-full object-cover ring-4 ring-transparent group-hover:ring-[var(--brand-primary)]/30 transition-all"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl font-bold text-white">
                                {channel.userName?.charAt(0)?.toUpperCase() ||
                                    "?"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate mb-1">
                    {channel.fullName || channel.userName}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate mb-2">
                    @{channel.userName}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">
                    {formatCount(channel.subscribersCount || 0)} subscribers
                </p>

                {/* Unsubscribe Button */}
                <button
                    onClick={handleUnsubscribe}
                    disabled={isUnsubscribing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-colors text-sm font-medium"
                >
                    {isUnsubscribing ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <FiUserMinus size={14} />
                            Unsubscribe
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const ChannelSkeleton = ({ viewMode = "grid" }) => {
    if (viewMode === "list") {
        return (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                <div className="w-14 h-14 skeleton rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded w-1/3" />
                    <div className="h-3 skeleton rounded w-1/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                </div>
                <div className="w-24 h-8 skeleton rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border-light)] p-4 sm:p-5 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 skeleton rounded-full mx-auto mb-3" />
            <div className="h-4 skeleton rounded w-2/3 mx-auto mb-2" />
            <div className="h-3 skeleton rounded w-1/2 mx-auto mb-2" />
            <div className="h-3 skeleton rounded w-1/3 mx-auto mb-3" />
            <div className="h-8 skeleton rounded-full w-full" />
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Subscriptions = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState("grid");

    const fetchSubscriptions = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const data = await getUserSubscriptions({ page: 1, limit: 50 });
            // Handle different response structures
            const channelList = Array.isArray(data)
                ? data
                : data.docs || data.channels || data.subscriptions || [];
            setChannels(channelList);
        } catch (error) {
            console.error("Failed to load subscriptions:", error);
            showError("Failed to load subscriptions");
            setChannels([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth?redirect=/subscriptions");
            return;
        }
        fetchSubscriptions();
    }, [isAuthenticated, navigate, fetchSubscriptions]);

    const handleUnsubscribe = async (channelId) => {
        try {
            await toggleSubscription(channelId);
            setChannels((prev) => prev.filter((c) => c._id !== channelId));
            showSuccess("Unsubscribed successfully");
        } catch (error) {
            showError("Failed to unsubscribe");
            throw error;
        }
    };

    const handleRefresh = () => {
        fetchSubscriptions(true);
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <FiBell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                Subscriptions
                            </h1>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                {loading
                                    ? "Loading..."
                                    : `${channels.length} ${
                                          channels.length === 1
                                              ? "channel"
                                              : "channels"
                                      }`}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Refresh"
                        >
                            <FiRefreshCw
                                size={20}
                                className={refreshing ? "animate-spin" : ""}
                            />
                        </button>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                }`}
                                title="Grid view"
                            >
                                <FiGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === "list"
                                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                }`}
                                title="List view"
                            >
                                <FiList size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                                : "space-y-3"
                        }
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ChannelSkeleton key={i} viewMode={viewMode} />
                        ))}
                    </div>
                ) : channels.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <EmptyState
                            preset="noSubscriptions"
                            actionLabel="Discover Channels"
                            action={() => navigate("/")}
                        />
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                                    : "space-y-3"
                            }
                        >
                            {channels.map((channel) => (
                                <ChannelCard
                                    key={channel._id}
                                    channel={channel}
                                    onUnsubscribe={handleUnsubscribe}
                                    viewMode={viewMode}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </PageTransition>
    );
};

export default Subscriptions;
