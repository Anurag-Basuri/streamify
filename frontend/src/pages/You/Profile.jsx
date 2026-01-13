/**
 * Profile Page
 * Personal identity showcase - who you are, your journey, social connections
 * Different from Dashboard (analytics) and Settings (configuration)
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiCamera,
    FiUsers,
    FiVideo,
    FiHeart,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiCheck,
    FiX,
    FiExternalLink,
    FiAward,
    FiTrendingUp,
    FiStar,
    FiBookOpen,
    FiRefreshCw,
    FiMail,
    FiEdit,
    FiMessageCircle,
    FiEye,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth.js";
import { updateAvatar, updateCoverImage } from "../../services/authService.js";
import { api } from "../../services/api.js";
import { PageTransition } from "../../components/Common";
import {
    showError,
    showSuccess,
} from "../../components/Common/ToastProvider.jsx";

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================

const AchievementBadge = ({
    icon: Icon,
    label,
    value,
    unlocked,
    color,
    delay = 0,
}) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, type: "spring" }}
        whileHover={{ scale: 1.05, y: -2 }}
        className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all cursor-default ${
            unlocked
                ? `${color} border-transparent shadow-lg`
                : "bg-[var(--bg-secondary)] border-dashed border-[var(--border-light)]"
        }`}
    >
        <Icon
            className={`w-7 h-7 mb-2 ${
                unlocked ? "text-white" : "text-[var(--text-tertiary)]"
            }`}
        />
        <span
            className={`text-xs font-medium text-center ${
                unlocked ? "text-white/90" : "text-[var(--text-tertiary)]"
            }`}
        >
            {label}
        </span>
        <span
            className={`text-xl font-bold mt-1 ${
                unlocked ? "text-white" : "text-[var(--text-secondary)]"
            }`}
        >
            {value}
        </span>
        {unlocked && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                <FiCheck className="w-3 h-3 text-green-500" />
            </div>
        )}
        {!unlocked && (
            <div className="absolute inset-0 rounded-2xl bg-[var(--bg-primary)]/50 flex items-center justify-center">
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                    Locked
                </span>
            </div>
        )}
    </motion.div>
);

// ============================================================================
// JOURNEY MILESTONE
// ============================================================================

const JourneyMilestone = ({
    icon: Icon,
    title,
    description,
    date,
    isLast,
    delay = 0,
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex gap-4"
    >
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center shadow-lg">
                <Icon className="w-5 h-5 text-white" />
            </div>
            {!isLast && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-[var(--brand-primary)]/50 to-transparent mt-2" />
            )}
        </div>
        <div className="pb-6 flex-1">
            <p className="font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                {description}
            </p>
            <p className="text-xs text-[var(--brand-primary)] mt-1 font-medium">
                {date}
            </p>
        </div>
    </motion.div>
);

// ============================================================================
// STAT CARD
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
        <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-xl font-bold text-[var(--text-primary)]">
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
        </div>
    </div>
);

// ============================================================================
// SKELETON LOADER
// ============================================================================

const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto animate-pulse">
        <div className="relative">
            <div className="h-48 sm:h-64 bg-gradient-to-r from-[var(--bg-tertiary)] to-[var(--bg-secondary)] rounded-b-3xl" />
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                <div className="w-28 h-28 rounded-full bg-[var(--bg-tertiary)] border-4 border-[var(--bg-primary)]" />
            </div>
        </div>
        <div className="pt-18 text-center space-y-3 mt-8">
            <div className="h-7 w-40 bg-[var(--bg-tertiary)] rounded-lg mx-auto" />
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 px-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="h-20 bg-[var(--bg-tertiary)] rounded-xl"
                />
            ))}
        </div>
    </div>
);

// ============================================================================
// MAIN PROFILE COMPONENT
// ============================================================================

const Profile = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [pendingCover, setPendingCover] = useState(null);

    // Fetch data
    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const response = await api.get("/api/v1/dashboard");
            setDashboardData(response.data?.data || null);
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
            if (!silent) showError("Failed to load profile data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/auth");
            return;
        }
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, isLoading, navigate, fetchData]);

    // Handle avatar upload
    const handleAvatarUpload = async () => {
        if (!pendingAvatar) return;
        setUploadingAvatar(true);
        try {
            const response = await updateAvatar(pendingAvatar);
            updateUser({ avatar: response.data?.avatar || response.avatar });
            setPendingAvatar(null);
            showSuccess("Avatar updated successfully!");
        } catch (error) {
            showError(error.message || "Failed to update avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Handle cover upload
    const handleCoverUpload = async () => {
        if (!pendingCover) return;
        setUploadingCover(true);
        try {
            const response = await updateCoverImage(pendingCover);
            updateUser({
                coverImage: response.data?.coverImage || response.coverImage,
            });
            setPendingCover(null);
            showSuccess("Cover image updated!");
        } catch (error) {
            showError(error.message || "Failed to update cover");
        } finally {
            setUploadingCover(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch {
            showError("Failed to logout");
        }
    };

    if (isLoading || loading) {
        return (
            <PageTransition className="min-h-screen">
                <ProfileSkeleton />
            </PageTransition>
        );
    }

    if (!user) return null;

    const stats = dashboardData?.stats || {};
    const content = dashboardData?.content || {};

    // Calculate member duration
    const joinDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const memberDays = Math.floor(
        (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const memberMonths = Math.floor(memberDays / 30);

    // Achievements
    const achievements = [
        {
            icon: FiVideo,
            label: "Creator",
            value: content.videos || 0,
            unlocked: (content.videos || 0) >= 1,
            color: "bg-gradient-to-br from-blue-500 to-cyan-500",
        },
        {
            icon: FiHeart,
            label: "Loved",
            value: stats.totalLikesReceived || 0,
            unlocked: (stats.totalLikesReceived || 0) >= 10,
            color: "bg-gradient-to-br from-pink-500 to-rose-500",
        },
        {
            icon: FiUsers,
            label: "Popular",
            value: stats.subscriberCount || 0,
            unlocked: (stats.subscriberCount || 0) >= 5,
            color: "bg-gradient-to-br from-purple-500 to-indigo-500",
        },
        {
            icon: FiMessageCircle,
            label: "Engaged",
            value: stats.totalCommentsReceived || 0,
            unlocked: (stats.totalCommentsReceived || 0) >= 5,
            color: "bg-gradient-to-br from-amber-500 to-orange-500",
        },
    ];

    // Milestones
    const milestones = [
        {
            icon: FiStar,
            title: "Joined Streamify",
            description: "Started your creative journey",
            date: joinDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }),
        },
        ...(content.videos > 0
            ? [
                  {
                      icon: FiVideo,
                      title: `Uploaded ${content.videos} Video${
                          content.videos > 1 ? "s" : ""
                      }`,
                      description: "Sharing content with the world",
                      date: "Creator milestone",
                  },
              ]
            : []),
        ...(stats.subscriberCount > 0
            ? [
                  {
                      icon: FiUsers,
                      title: `${stats.subscriberCount} Subscriber${
                          stats.subscriberCount > 1 ? "s" : ""
                      }`,
                      description: "Building your community",
                      date: "Growing!",
                  },
              ]
            : []),
        ...(stats.totalLikesReceived >= 10
            ? [
                  {
                      icon: FiHeart,
                      title: "10+ Likes Received",
                      description: "Your content is being appreciated",
                      date: "Loved by many",
                  },
              ]
            : []),
    ];

    return (
        <PageTransition className="min-h-screen pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Cover Section */}
                <div className="relative">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative h-48 sm:h-64 rounded-b-3xl overflow-hidden"
                    >
                        {pendingCover || user.coverImage ? (
                            <img
                                src={
                                    pendingCover
                                        ? URL.createObjectURL(pendingCover)
                                        : user.coverImage
                                }
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Refresh button */}
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-colors"
                        >
                            <FiRefreshCw
                                className={refreshing ? "animate-spin" : ""}
                                size={18}
                            />
                        </button>

                        {/* Cover upload */}
                        {!user.isGoogleUser && (
                            <label className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur text-white text-sm cursor-pointer hover:bg-black/50 transition-colors">
                                <FiCamera size={16} />
                                <span className="hidden sm:inline">Cover</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        e.target.files?.[0] &&
                                        setPendingCover(e.target.files[0])
                                    }
                                    className="hidden"
                                />
                            </label>
                        )}

                        {/* Pending cover actions */}
                        <AnimatePresence>
                            {pendingCover && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-4 left-4 flex gap-2"
                                >
                                    <button
                                        onClick={() => setPendingCover(null)}
                                        className="p-2 rounded-full bg-red-500 text-white shadow-lg"
                                    >
                                        <FiX size={18} />
                                    </button>
                                    <button
                                        onClick={handleCoverUpload}
                                        disabled={uploadingCover}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white shadow-lg"
                                    >
                                        {uploadingCover ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FiCheck size={18} />
                                        )}
                                        Save
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute -bottom-14 left-1/2 -translate-x-1/2"
                    >
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-[var(--bg-primary)] overflow-hidden bg-[var(--bg-elevated)] shadow-2xl">
                                <img
                                    src={
                                        pendingAvatar
                                            ? URL.createObjectURL(pendingAvatar)
                                            : user.avatar
                                    }
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Avatar upload */}
                            {!user.isGoogleUser && !pendingAvatar && (
                                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                    <FiCamera
                                        size={14}
                                        className="text-white"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            e.target.files?.[0] &&
                                            setPendingAvatar(e.target.files[0])
                                        }
                                        className="hidden"
                                    />
                                </label>
                            )}

                            {/* Pending avatar actions */}
                            <AnimatePresence>
                                {pendingAvatar && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2"
                                    >
                                        <button
                                            onClick={() =>
                                                setPendingAvatar(null)
                                            }
                                            className="w-7 h-7 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center"
                                        >
                                            <FiX size={14} />
                                        </button>
                                        <button
                                            onClick={handleAvatarUpload}
                                            disabled={uploadingAvatar}
                                            className="w-7 h-7 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center"
                                        >
                                            {uploadingAvatar ? (
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FiCheck size={14} />
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Profile Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="pt-18 mt-8 text-center px-4"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        {user.fullName}
                    </h1>
                    <p className="text-[var(--text-tertiary)] mt-1">
                        @{user.userName}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1.5">
                            <FiMail
                                size={14}
                                className="text-[var(--text-tertiary)]"
                            />
                            {user.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FiCalendar
                                size={14}
                                className="text-[var(--text-tertiary)]"
                            />
                            {memberMonths > 0
                                ? `${memberMonths} month${
                                      memberMonths > 1 ? "s" : ""
                                  }`
                                : `${memberDays || 1} day${
                                      memberDays !== 1 ? "s" : ""
                                  }`}{" "}
                            on Streamify
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        <Link
                            to={`/channel/${user.userName}`}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-medium shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <FiExternalLink size={16} />
                            View Channel
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <FiSettings size={16} />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/5 transition-all"
                        >
                            <FiLogOut size={16} />
                            Logout
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 px-4"
                >
                    <StatCard
                        icon={FiVideo}
                        value={content.videos || 0}
                        label="Videos"
                        color="bg-gradient-to-br from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        icon={FiUsers}
                        value={stats.subscriberCount || 0}
                        label="Subscribers"
                        color="bg-gradient-to-br from-purple-500 to-indigo-500"
                    />
                    <StatCard
                        icon={FiHeart}
                        value={stats.totalLikesReceived || 0}
                        label="Likes"
                        color="bg-gradient-to-br from-pink-500 to-rose-500"
                    />
                    <StatCard
                        icon={FiEye}
                        value={stats.totalViews || 0}
                        label="Views"
                        color="bg-gradient-to-br from-amber-500 to-orange-500"
                    />
                </motion.div>

                {/* Achievements */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-8 px-4"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <FiAward className="text-amber-500" />
                        Achievements
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {achievements.map((achievement, i) => (
                            <AchievementBadge
                                key={i}
                                {...achievement}
                                delay={0.3 + i * 0.05}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Journey */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-8 px-4"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <FiBookOpen className="text-[var(--brand-primary)]" />
                        Your Journey
                    </h2>
                    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-5">
                        {milestones.map((milestone, i) => (
                            <JourneyMilestone
                                key={i}
                                {...milestone}
                                isLast={i === milestones.length - 1}
                                delay={0.4 + i * 0.08}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Quick Access */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="mt-8 px-4"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiTrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--text-primary)]">
                                    Dashboard
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    Analytics & insights
                                </p>
                            </div>
                        </Link>
                        <Link
                            to="/uservideos"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiVideo className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--text-primary)]">
                                    Your Videos
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    {content.videos || 0} uploads
                                </p>
                            </div>
                        </Link>
                        <Link
                            to="/subscriptions"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiUsers className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--text-primary)]">
                                    Subscriptions
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    {stats.subscriptionCount || 0} following
                                </p>
                            </div>
                        </Link>
                    </div>
                </motion.section>
            </div>
        </PageTransition>
    );
};

export default Profile;
