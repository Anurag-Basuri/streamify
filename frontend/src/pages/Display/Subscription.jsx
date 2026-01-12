import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUsers,
    FiGrid,
    FiList,
    FiRefreshCw,
    FiUserMinus,
    FiUserCheck,
    FiVideo,
    FiSearch,
    FiX,
    FiFilter,
    FiPlay,
    FiExternalLink,
    FiChevronDown,
    FiCheck,
    FiBell,
    FiBellOff,
    FiTrendingUp,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { PageTransition, EmptyState } from "../../components/Common";
import { showError, showSuccess } from "../../components/Common/ToastProvider";
import { getUserSubscriptions, toggleSubscription } from "../../services";
import { formatCount } from "../../utils";

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS = [
    { value: "recent", label: "Recently Subscribed" },
    { value: "name", label: "Name (A-Z)" },
    { value: "subscribers", label: "Most Subscribers" },
    { value: "videos", label: "Most Videos" },
];

// ============================================================================
// CONFIRMATION MODAL
// ============================================================================

const UnsubscribeModal = ({
    isOpen,
    channel,
    onConfirm,
    onCancel,
    loading,
}) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--bg-elevated)] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--border-light)]"
                >
                    <div className="text-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 mx-auto mb-4 relative">
                            {channel?.avatar ? (
                                <img
                                    src={channel.avatar}
                                    alt={channel.userName}
                                    className="w-full h-full rounded-full object-cover ring-4 ring-[var(--error)]/20"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {channel?.userName
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--error)] rounded-full flex items-center justify-center border-4 border-[var(--bg-elevated)]">
                                <FiUserMinus size={14} className="text-white" />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                            Unsubscribe from{" "}
                            {channel?.fullName || channel?.userName}?
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            You will no longer receive updates from this
                            channel.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--error)] text-white font-medium hover:bg-[var(--error-hover)] transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FiUserMinus size={16} />
                                        Unsubscribe
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ============================================================================
// SORT DROPDOWN
// ============================================================================

const SortDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = SORT_OPTIONS.find((o) => o.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm font-medium transition-colors"
            >
                <FiFilter size={16} />
                <span className="hidden sm:inline">{selected?.label}</span>
                <FiChevronDown
                    size={16}
                    className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-elevated)] rounded-xl shadow-xl border border-[var(--border-light)] overflow-hidden z-20"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                                        value === option.value
                                            ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                                            : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                                    }`}
                                >
                                    {option.label}
                                    {value === option.value && (
                                        <FiCheck size={16} />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// SEARCH BAR
// ============================================================================

const SearchBar = ({ value, onChange }) => (
    <div className="relative flex-1 max-w-md">
        <FiSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-transparent focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm transition-all outline-none"
        />
        {value && (
            <button
                onClick={() => onChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
                <FiX size={16} />
            </button>
        )}
    </div>
);

// ============================================================================
// STATS CARD
// ============================================================================

const StatsCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-light)] flex items-center gap-3"
    >
        <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
        >
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
                {value}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
        </div>
    </motion.div>
);

// ============================================================================
// CHANNEL CARD - ENHANCED
// ============================================================================

const ChannelCard = ({
    channel,
    onUnsubscribe,
    viewMode = "grid",
    index = 0,
}) => {
    const navigate = useNavigate();

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
                transition={{ delay: index * 0.03 }}
                className="group"
            >
                <div
                    onClick={handleCardClick}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)] cursor-pointer transition-all hover:shadow-lg"
                >
                    {/* Avatar with status */}
                    <div className="relative flex-shrink-0">
                        {channel.avatar ? (
                            <img
                                src={channel.avatar}
                                alt={channel.userName}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[var(--brand-primary)] transition-all"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {channel.userName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "?"}
                                </span>
                            </div>
                        )}
                        {/* Online indicator (mockup) */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-elevated)]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                                {channel.fullName || channel.userName}
                            </h3>
                            <FiCheck
                                size={14}
                                className="text-[var(--brand-primary)] flex-shrink-0"
                            />
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] truncate mb-1">
                            @{channel.userName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                            <span className="flex items-center gap-1">
                                <FiUsers size={12} />
                                {formatCount(channel.subscribersCount || 0)}
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
                            onClick={() =>
                                navigate(`/channel/${channel.userName}`)
                            }
                            className="p-2.5 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors"
                            title="View Channel"
                        >
                            <FiExternalLink size={18} />
                        </button>
                        <button
                            onClick={() => onUnsubscribe(channel)}
                            className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
                            title="Unsubscribe"
                        >
                            <FiUserMinus size={18} />
                        </button>
                    </div>
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
            transition={{ delay: index * 0.03 }}
            className="group"
        >
            <div
                onClick={handleCardClick}
                className="bg-[var(--bg-elevated)] rounded-2xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--brand-primary)] transition-all shadow-sm hover:shadow-xl cursor-pointer relative"
            >
                {/* Banner/Cover */}
                <div className="h-20 bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 relative">
                    {channel.coverImage && (
                        <img
                            src={channel.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    )}
                    {/* Subscribed badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-medium flex items-center gap-1">
                        <FiUserCheck size={10} />
                        Subscribed
                    </div>
                </div>

                {/* Avatar - Overlapping */}
                <div className="relative -mt-10 mb-2 flex justify-center">
                    {channel.avatar ? (
                        <img
                            src={channel.avatar}
                            alt={channel.userName}
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-[var(--bg-elevated)] group-hover:ring-[var(--brand-primary)]/30 transition-all shadow-lg"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center ring-4 ring-[var(--bg-elevated)] shadow-lg">
                            <span className="text-2xl font-bold text-white">
                                {channel.userName?.charAt(0)?.toUpperCase() ||
                                    "?"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-4 pb-4 text-center">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate mb-0.5">
                        {channel.fullName || channel.userName}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] truncate mb-3">
                        @{channel.userName}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-4 mb-4 text-xs">
                        <div className="text-center">
                            <p className="font-bold text-[var(--text-primary)]">
                                {formatCount(channel.subscribersCount || 0)}
                            </p>
                            <p className="text-[var(--text-tertiary)]">
                                Subscribers
                            </p>
                        </div>
                        <div className="w-px bg-[var(--divider)]" />
                        <div className="text-center">
                            <p className="font-bold text-[var(--text-primary)]">
                                {formatCount(channel.videosCount || 0)}
                            </p>
                            <p className="text-[var(--text-tertiary)]">
                                Videos
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() =>
                                navigate(`/channel/${channel.userName}`)
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
                        >
                            <FiPlay size={12} />
                            View Channel
                        </button>
                        <button
                            onClick={() => onUnsubscribe(channel)}
                            className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
                            title="Unsubscribe"
                        >
                            <FiUserMinus size={16} />
                        </button>
                    </div>
                </div>
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
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                <div className="w-16 h-16 skeleton rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded w-1/3" />
                    <div className="h-3 skeleton rounded w-1/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 skeleton rounded-xl" />
                    <div className="w-10 h-10 skeleton rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-elevated)] rounded-2xl overflow-hidden border border-[var(--border-light)]">
            <div className="h-20 skeleton" />
            <div className="relative -mt-10 mb-2 flex justify-center">
                <div className="w-20 h-20 skeleton rounded-full ring-4 ring-[var(--bg-elevated)]" />
            </div>
            <div className="px-4 pb-4 text-center space-y-2">
                <div className="h-4 skeleton rounded w-2/3 mx-auto" />
                <div className="h-3 skeleton rounded w-1/2 mx-auto" />
                <div className="flex justify-center gap-4 my-3">
                    <div className="h-8 w-16 skeleton rounded" />
                    <div className="h-8 w-16 skeleton rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 h-9 skeleton rounded-xl" />
                    <div className="w-9 h-9 skeleton rounded-xl" />
                </div>
            </div>
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
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [unsubModal, setUnsubModal] = useState({
        open: false,
        channel: null,
    });
    const [unsubscribing, setUnsubscribing] = useState(false);

    const fetchSubscriptions = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const data = await getUserSubscriptions({ page: 1, limit: 100 });
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

    const handleUnsubscribeClick = (channel) => {
        setUnsubModal({ open: true, channel });
    };

    const handleUnsubscribeConfirm = async () => {
        if (!unsubModal.channel) return;
        setUnsubscribing(true);
        try {
            await toggleSubscription(unsubModal.channel._id);
            setChannels((prev) =>
                prev.filter((c) => c._id !== unsubModal.channel._id)
            );
            showSuccess(
                `Unsubscribed from ${
                    unsubModal.channel.fullName || unsubModal.channel.userName
                }`
            );
            setUnsubModal({ open: false, channel: null });
        } catch (error) {
            showError("Failed to unsubscribe");
        } finally {
            setUnsubscribing(false);
        }
    };

    const handleRefresh = () => {
        fetchSubscriptions(true);
    };

    // Filter and sort channels
    const filteredChannels = useMemo(() => {
        let result = [...channels];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.userName?.toLowerCase().includes(query) ||
                    c.fullName?.toLowerCase().includes(query)
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return (a.fullName || a.userName || "").localeCompare(
                        b.fullName || b.userName || ""
                    );
                case "subscribers":
                    return (
                        (b.subscribersCount || 0) - (a.subscribersCount || 0)
                    );
                case "videos":
                    return (b.videosCount || 0) - (a.videosCount || 0);
                default:
                    return 0; // Keep original order for "recent"
            }
        });

        return result;
    }, [channels, searchQuery, sortBy]);

    // Stats
    const totalSubscribers = useMemo(
        () => channels.reduce((sum, c) => sum + (c.subscribersCount || 0), 0),
        [channels]
    );
    const totalVideos = useMemo(
        () => channels.reduce((sum, c) => sum + (c.videosCount || 0), 0),
        [channels]
    );

    return (
        <PageTransition className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                                <FiUsers className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                    Subscriptions
                                </h1>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    Manage your favorite creators
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards - Desktop */}
                        {!loading && channels.length > 0 && (
                            <div className="hidden lg:flex gap-3">
                                <StatsCard
                                    icon={FiUsers}
                                    label="Channels"
                                    value={channels.length}
                                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                                />
                                <StatsCard
                                    icon={FiTrendingUp}
                                    label="Combined Reach"
                                    value={formatCount(totalSubscribers)}
                                    color="bg-gradient-to-br from-green-500 to-green-600"
                                />
                            </div>
                        )}
                    </div>

                    {/* Controls Bar */}
                    {!loading && channels.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />

                            <div className="flex items-center gap-2">
                                <SortDropdown
                                    value={sortBy}
                                    onChange={setSortBy}
                                />

                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                    title="Refresh"
                                >
                                    <FiRefreshCw
                                        size={18}
                                        className={
                                            refreshing ? "animate-spin" : ""
                                        }
                                    />
                                </button>

                                {/* View Toggle */}
                                <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-colors ${
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
                                        className={`p-2 rounded-lg transition-colors ${
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
                        </div>
                    )}
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                : "space-y-3"
                        }
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <ChannelSkeleton key={i} viewMode={viewMode} />
                        ))}
                    </div>
                ) : channels.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-12"
                    >
                        <EmptyState
                            preset="noSubscriptions"
                            actionLabel="Discover Channels"
                            action={() => navigate("/")}
                        />
                    </motion.div>
                ) : filteredChannels.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <FiSearch
                            size={48}
                            className="mx-auto text-[var(--text-tertiary)] mb-4"
                        />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            No results found
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            No channels match "{searchQuery}"
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
                        >
                            Clear search
                        </button>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                    : "space-y-3"
                            }
                        >
                            {filteredChannels.map((channel, index) => (
                                <ChannelCard
                                    key={channel._id}
                                    channel={channel}
                                    onUnsubscribe={handleUnsubscribeClick}
                                    viewMode={viewMode}
                                    index={index}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Unsubscribe Confirmation Modal */}
            <UnsubscribeModal
                isOpen={unsubModal.open}
                channel={unsubModal.channel}
                onConfirm={handleUnsubscribeConfirm}
                onCancel={() => setUnsubModal({ open: false, channel: null })}
                loading={unsubscribing}
            />
        </PageTransition>
    );
};

export default Subscriptions;
