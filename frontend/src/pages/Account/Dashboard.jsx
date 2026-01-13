/**
 * Dashboard Page
 * Comprehensive user stats, channel analytics, and activity feed
 */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiPlay,
    FiEye,
    FiUsers,
    FiHeart,
    FiTrendingUp,
    FiUpload,
    FiList,
    FiSettings,
    FiVideo,
    FiMessageCircle,
    FiCalendar,
    FiClock,
    FiActivity,
    FiEdit3,
    FiBarChart2,
    FiRefreshCw,
    FiChevronRight,
    FiZap,
    FiAward,
    FiBookmark,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import useAuth from "../../hooks/useAuth";
import { api } from "../../services/api";
import { PageTransition, EmptyState } from "../../components/Common";
import { showError } from "../../components/Common/ToastProvider";
import { DASHBOARD } from "../../constants";
import { formatRelativeTime } from "../../utils";

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ icon: Icon, label, value, subValue, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="relative overflow-hidden bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-5 hover:border-[var(--brand-primary)]/30 transition-all group"
    >
        {/* Background gradient accent */}
        <div
            className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 blur-3xl transform translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`}
        />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {subValue && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">
                        {subValue}
                    </span>
                )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value || "0"}
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{label}</p>
        </div>
    </motion.div>
);

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

const QuickActionCard = ({
    icon: Icon,
    label,
    description,
    to,
    color,
    delay = 0,
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 300 }}
    >
        <Link
            to={to}
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] hover:border-[var(--brand-primary)]/50 hover:shadow-lg transition-all group"
        >
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
            >
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                    {label}
                </p>
                <p className="text-sm text-[var(--text-tertiary)] truncate">
                    {description}
                </p>
            </div>
            <FiChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
        </Link>
    </motion.div>
);

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

const ActivityItem = ({ activity, delay = 0 }) => {
    const getIcon = (type) => {
        const icons = {
            video_watch: FiPlay,
            video_upload: FiUpload,
            video_like: FiHeart,
            comment_add: FiMessageCircle,
            comment_like: FiHeart,
            tweet_create: FiEdit3,
            tweet_like: FiHeart,
            subscription_add: FiUsers,
            subscription_remove: FiUsers,
            playlist_create: FiList,
            watchlater_add: FiClock,
        };
        return icons[type] || FiActivity;
    };

    const getColor = (type) => {
        if (type.includes("like")) return "text-pink-500 bg-pink-500/10";
        if (type.includes("video")) return "text-blue-500 bg-blue-500/10";
        if (type.includes("tweet")) return "text-purple-500 bg-purple-500/10";
        if (type.includes("subscription"))
            return "text-green-500 bg-green-500/10";
        return "text-[var(--text-secondary)] bg-[var(--bg-tertiary)]";
    };

    const Icon = getIcon(activity.type);
    const colorClass = getColor(activity.type);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-4 py-3 border-b border-[var(--divider)] last:border-0"
        >
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
            >
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] line-clamp-1">
                    {activity.message}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                    {formatRelativeTime(activity.time)}
                </p>
            </div>
        </motion.div>
    );
};

// ============================================================================
// TOP VIDEO CARD
// ============================================================================

const TopVideoCard = ({ video, rank, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Link
            to={`/video/${video._id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group"
        >
            <div className="relative flex-shrink-0">
                <span className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center justify-center shadow-lg">
                    {rank}
                </span>
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-12 rounded-lg object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors">
                    {video.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                        <FiEye size={12} />
                        {(video.views || 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </Link>
    </motion.div>
);

// ============================================================================
// SKELETON LOADERS
// ============================================================================

const DashboardSkeleton = () => (
    <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
            <div>
                <div className="h-8 w-64 skeleton rounded-lg" />
                <div className="h-4 w-48 skeleton rounded mt-2" />
            </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-5"
                >
                    <div className="w-11 h-11 skeleton rounded-xl mb-3" />
                    <div className="h-8 w-20 skeleton rounded mb-2" />
                    <div className="h-4 w-24 skeleton rounded" />
                </div>
            ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-6">
                <div className="h-6 w-32 skeleton rounded mb-4" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 mb-4">
                        <div className="w-12 h-12 skeleton rounded-xl" />
                        <div className="flex-1">
                            <div className="h-4 w-full skeleton rounded mb-2" />
                            <div className="h-3 w-24 skeleton rounded" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-6">
                <div className="h-6 w-32 skeleton rounded mb-4" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 mb-4">
                        <div className="w-9 h-9 skeleton rounded-full" />
                        <div className="flex-1">
                            <div className="h-4 w-full skeleton rounded mb-1" />
                            <div className="h-3 w-16 skeleton rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const response = await api.get(DASHBOARD.STATS);
            setData(response.data?.data || null);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            if (!silent) {
                showError("Failed to load dashboard");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, navigate, fetchDashboardData]);

    const quickActions = [
        {
            icon: FiUpload,
            label: "Upload Video",
            description: "Share new content",
            to: "/create",
            color: "bg-gradient-to-br from-purple-500 to-indigo-600",
        },
        {
            icon: FiVideo,
            label: "Your Videos",
            description: `${data?.content?.videos || 0} videos`,
            to: "/uservideos",
            color: "bg-gradient-to-br from-blue-500 to-cyan-600",
        },
        {
            icon: FiList,
            label: "Playlists",
            description: "Organize content",
            to: "/playlist",
            color: "bg-gradient-to-br from-pink-500 to-rose-600",
        },
        {
            icon: FiBookmark,
            label: "Watch Later",
            description: `${data?.quickStats?.pendingWatchLater || 0} saved`,
            to: "/watchlater",
            color: "bg-gradient-to-br from-amber-500 to-orange-600",
        },
        {
            icon: FiBarChart2,
            label: "History",
            description: `${data?.quickStats?.historyItems || 0} watched`,
            to: "/history",
            color: "bg-gradient-to-br from-green-500 to-emerald-600",
        },
        {
            icon: FiSettings,
            label: "Settings",
            description: "Customize account",
            to: "/settings",
            color: "bg-gradient-to-br from-gray-500 to-gray-700",
        },
    ];

    if (loading) {
        return (
            <PageTransition className="min-h-screen">
                <DashboardSkeleton />
            </PageTransition>
        );
    }

    return (
        <PageTransition className="min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        {/* User Avatar */}
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[var(--brand-primary)]/20"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {user?.fullName?.charAt(0)?.toUpperCase() ||
                                        "?"}
                                </span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                Welcome back,{" "}
                                {user?.fullName?.split(" ")[0] || "Creator"}!
                            </h1>
                            <p className="text-[var(--text-tertiary)] flex items-center gap-2 mt-1">
                                <FiCalendar size={14} />
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <FiRefreshCw
                            className={refreshing ? "animate-spin" : ""}
                            size={16}
                        />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                </motion.div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        icon={FiEye}
                        label="Total Views"
                        value={data?.stats?.totalViews}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        delay={0.1}
                    />
                    <StatCard
                        icon={FiUsers}
                        label="Subscribers"
                        value={data?.stats?.subscriberCount}
                        color="bg-gradient-to-br from-pink-500 to-pink-600"
                        delay={0.15}
                    />
                    <StatCard
                        icon={FiHeart}
                        label="Likes Received"
                        value={data?.stats?.totalLikesReceived}
                        color="bg-gradient-to-br from-red-500 to-rose-600"
                        delay={0.2}
                    />
                    <StatCard
                        icon={FiZap}
                        label="Engagement"
                        value={`${data?.stats?.engagementRate || 0}%`}
                        subValue="rate"
                        color="bg-gradient-to-br from-amber-500 to-orange-600"
                        delay={0.25}
                    />
                </div>

                {/* Secondary Stats Row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                        <FiVideo className="w-5 h-5 text-purple-500" />
                        <div>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {data?.content?.videos || 0}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                Videos
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                        <FiEdit3 className="w-5 h-5 text-indigo-500" />
                        <div>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {data?.content?.tweets || 0}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                Posts
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                        <FiMessageCircle className="w-5 h-5 text-cyan-500" />
                        <div>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {data?.stats?.totalCommentsReceived || 0}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                Comments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                        <FiActivity className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {data?.engagement?.weeklyActivity || 0}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                This Week
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions - spans 2 cols on lg */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="lg:col-span-2"
                    >
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <HiSparkles className="text-[var(--brand-primary)]" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {quickActions.map((action, i) => (
                                <QuickActionCard
                                    key={action.label}
                                    {...action}
                                    delay={0.4 + i * 0.05}
                                />
                            ))}
                        </div>
                    </motion.section>

                    {/* Recent Activity */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <FiActivity className="text-[var(--brand-primary)]" />
                            Recent Activity
                        </h2>
                        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-4">
                            {data?.recentActivity?.length > 0 ? (
                                <div className="space-y-1">
                                    <AnimatePresence>
                                        {data.recentActivity
                                            .slice(0, 6)
                                            .map((activity, i) => (
                                                <ActivityItem
                                                    key={activity._id || i}
                                                    activity={activity}
                                                    delay={0.55 + i * 0.05}
                                                />
                                            ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <FiActivity className="w-10 h-10 mx-auto text-[var(--text-tertiary)] mb-3" />
                                    <p className="text-sm text-[var(--text-tertiary)]">
                                        No recent activity
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>

                {/* Top Videos Section */}
                {data?.topVideos?.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <FiAward className="text-amber-500" />
                                Top Performing Videos
                            </h2>
                            <Link
                                to="/uservideos"
                                className="text-sm text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                            >
                                View All <FiChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {data.topVideos.map((video, i) => (
                                    <TopVideoCard
                                        key={video._id}
                                        video={video}
                                        rank={i + 1}
                                        delay={0.65 + i * 0.05}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}
            </div>
        </PageTransition>
    );
};

export default Dashboard;
