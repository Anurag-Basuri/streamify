/**
 * Dashboard Page
 * User stats, recent activity, and quick actions
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiPlay,
    FiEye,
    FiUsers,
    FiHeart,
    FiClock,
    FiTrendingUp,
    FiUpload,
    FiList,
    FiSettings,
    FiVideo,
    FiActivity,
    FiCalendar,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { api } from "../../services/api";
import { PageTransition, EmptyState } from "../../components/Common";
import { showError } from "../../components/Common/ToastProvider";
import { DASHBOARD } from "../../constants";

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ icon: Icon, label, value, trend, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="card p-6 hover-lift"
    >
        <div className="flex items-start justify-between">
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
            >
                <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
                <span
                    className={`text-sm font-medium flex items-center gap-1 ${
                        trend > 0
                            ? "text-[var(--success)]"
                            : "text-[var(--error)]"
                    }`}
                >
                    <FiTrendingUp
                        className={trend < 0 ? "rotate-180" : ""}
                        size={14}
                    />
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-[var(--text-primary)]">
                {value?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{label}</p>
        </div>
    </motion.div>
);

// ============================================================================
// QUICK ACTION COMPONENT
// ============================================================================

const QuickAction = ({ icon: Icon, label, to, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 300 }}
    >
        <Link
            to={to}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] hover:border-[var(--brand-primary)] hover:shadow-lg transition-all group`}
        >
            <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
            >
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                {label}
            </span>
        </Link>
    </motion.div>
);

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

const ActivityItem = ({ activity, delay = 0 }) => {
    const icons = {
        upload: FiUpload,
        view: FiEye,
        like: FiHeart,
        subscribe: FiUsers,
        comment: FiActivity,
    };
    const Icon = icons[activity.type] || FiActivity;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                    {activity.message}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                    {activity.time}
                </p>
            </div>
        </motion.div>
    );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get(DASHBOARD.STATS);
            setStats(
                response.data?.data || {
                    totalViews: 0,
                    totalVideos: 0,
                    totalSubscribers: 0,
                    totalLikes: 0,
                }
            );

            // Mock recent activity for now
            setRecentActivity([
                {
                    type: "view",
                    message: "Your video got 50 new views",
                    time: "2 hours ago",
                },
                {
                    type: "like",
                    message: "Someone liked your video",
                    time: "4 hours ago",
                },
                {
                    type: "subscribe",
                    message: "New subscriber!",
                    time: "Yesterday",
                },
            ]);
        } catch (error) {
            // Use default stats if API fails
            setStats({
                totalViews: 0,
                totalVideos: 0,
                totalSubscribers: 0,
                totalLikes: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            icon: FiUpload,
            label: "Upload Video",
            to: "/create",
            color: "bg-gradient-to-br from-purple-500 to-indigo-600",
        },
        {
            icon: FiList,
            label: "Playlists",
            to: "/playlist",
            color: "bg-gradient-to-br from-blue-500 to-cyan-600",
        },
        {
            icon: FiVideo,
            label: "Your Videos",
            to: "/uservideos",
            color: "bg-gradient-to-br from-pink-500 to-rose-600",
        },
        {
            icon: FiSettings,
            label: "Settings",
            to: "/settings",
            color: "bg-gradient-to-br from-gray-500 to-gray-700",
        },
    ];

    if (loading) {
        return (
            <PageTransition className="min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card p-6">
                                <div className="w-12 h-12 skeleton rounded-xl mb-4" />
                                <div className="h-8 skeleton rounded w-1/2 mb-2" />
                                <div className="h-4 skeleton rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                            Welcome back,{" "}
                            {user?.fullName?.split(" ")[0] || "Creator"}!
                        </h1>
                        <p className="text-[var(--text-tertiary)] mt-1">
                            Here's what's happening with your channel
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                        <FiCalendar size={16} />
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                        icon={FiEye}
                        label="Total Views"
                        value={stats?.totalViews}
                        trend={12}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        delay={0.1}
                    />
                    <StatCard
                        icon={FiVideo}
                        label="Total Videos"
                        value={stats?.totalVideos}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        delay={0.2}
                    />
                    <StatCard
                        icon={FiUsers}
                        label="Subscribers"
                        value={stats?.totalSubscribers}
                        trend={8}
                        color="bg-gradient-to-br from-pink-500 to-pink-600"
                        delay={0.3}
                    />
                    <StatCard
                        icon={FiHeart}
                        label="Total Likes"
                        value={stats?.totalLikes}
                        trend={-3}
                        color="bg-gradient-to-br from-red-500 to-red-600"
                        delay={0.4}
                    />
                </div>

                {/* Quick Actions */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {quickActions.map((action, i) => (
                            <QuickAction
                                key={action.label}
                                {...action}
                                delay={0.4 + i * 0.1}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Recent Activity */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Recent Activity
                    </h2>
                    <div className="card divide-y divide-[var(--divider)]">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <ActivityItem
                                    key={i}
                                    activity={activity}
                                    delay={0.6 + i * 0.1}
                                />
                            ))
                        ) : (
                            <EmptyState
                                preset="noNotifications"
                                size="sm"
                                title="No recent activity"
                                description="Your recent activity will appear here"
                            />
                        )}
                    </div>
                </motion.section>
            </div>
        </PageTransition>
    );
};

export default Dashboard;
