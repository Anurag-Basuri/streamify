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
    FiEdit3,
    FiUsers,
    FiVideo,
    FiHeart,
    FiCalendar,
    FiMapPin,
    FiLink,
    FiSettings,
    FiLogOut,
    FiCheck,
    FiX,
    FiExternalLink,
    FiClock,
    FiAward,
    FiTrendingUp,
    FiStar,
    FiBookOpen,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
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

const AchievementBadge = ({ icon: Icon, label, value, unlocked, color }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
            unlocked
                ? `${color} border-transparent shadow-lg`
                : "bg-[var(--bg-secondary)] border-dashed border-[var(--border-light)] opacity-60"
        }`}
    >
        <Icon
            className={`w-8 h-8 mb-2 ${
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
        {value && (
            <span
                className={`text-lg font-bold ${
                    unlocked ? "text-white" : "text-[var(--text-secondary)]"
                }`}
            >
                {value}
            </span>
        )}
        {unlocked && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                <FiCheck className="w-3 h-3 text-green-500" />
            </div>
        )}
    </motion.div>
);

// ============================================================================
// JOURNEY MILESTONE
// ============================================================================

const JourneyMilestone = ({ icon: Icon, title, description, date, isLast }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
            </div>
            {!isLast && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-[var(--brand-primary)] to-transparent mt-2" />
            )}
        </div>
        <div className="pb-8">
            <p className="font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-sm text-[var(--text-tertiary)]">{description}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{date}</p>
        </div>
    </div>
);

// ============================================================================
// STAT PILL
// ============================================================================

const StatPill = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)]/80 backdrop-blur">
        <Icon className="w-4 h-4 text-[var(--brand-primary)]" />
        <span className="font-bold text-[var(--text-primary)]">{value}</span>
        <span className="text-sm text-[var(--text-tertiary)]">{label}</span>
    </div>
);

// ============================================================================
// SKELETON LOADER
// ============================================================================

const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto">
        <div className="relative">
            <div className="h-56 sm:h-72 skeleton rounded-b-3xl" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="w-32 h-32 skeleton rounded-full border-4 border-[var(--bg-primary)]" />
            </div>
        </div>
        <div className="pt-20 text-center space-y-3">
            <div className="h-8 w-48 skeleton rounded mx-auto" />
            <div className="h-4 w-32 skeleton rounded mx-auto" />
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
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [pendingCover, setPendingCover] = useState(null);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/v1/dashboard");
            setDashboardData(response.data?.data || null);
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
        } finally {
            setLoading(false);
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
            showSuccess("Avatar updated!");
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
            showSuccess("Cover updated!");
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

    // Achievements data
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
            icon: FiClock,
            label: "Veteran",
            value: `${memberMonths}mo`,
            unlocked: memberDays >= 30,
            color: "bg-gradient-to-br from-amber-500 to-orange-500",
        },
    ];

    // Journey milestones
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
                      title: "First Upload",
                      description: `You've uploaded ${content.videos} video${
                          content.videos > 1 ? "s" : ""
                      }`,
                      date: "Keep creating!",
                  },
              ]
            : []),
        ...(stats.subscriberCount > 0
            ? [
                  {
                      icon: FiUsers,
                      title: "Building Community",
                      description: `${stats.subscriberCount} people follow your journey`,
                      date: "Growing strong!",
                  },
              ]
            : []),
    ];

    return (
        <PageTransition className="min-h-screen pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Hero Cover Section */}
                <div className="relative">
                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative h-56 sm:h-72 rounded-b-3xl overflow-hidden"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Cover upload button */}
                        {!user.isGoogleUser && (
                            <label className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium cursor-pointer hover:bg-white/30 transition-colors">
                                <FiCamera size={16} />
                                <span className="hidden sm:inline">
                                    Change Cover
                                </span>
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
                                        className="p-2 rounded-full bg-red-500/80 text-white"
                                    >
                                        <FiX size={18} />
                                    </button>
                                    <button
                                        onClick={handleCoverUpload}
                                        disabled={uploadingCover}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/80 text-white"
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

                        {/* Stats floating pills */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 sm:flex">
                            <StatPill
                                icon={FiVideo}
                                value={content.videos || 0}
                                label="videos"
                            />
                            <StatPill
                                icon={FiUsers}
                                value={stats.subscriberCount || 0}
                                label="subscribers"
                            />
                            <StatPill
                                icon={FiHeart}
                                value={stats.totalLikesReceived || 0}
                                label="likes"
                            />
                        </div>
                    </motion.div>

                    {/* Avatar - Centered and overlapping */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2"
                    >
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-primary)] overflow-hidden bg-[var(--bg-elevated)] shadow-2xl">
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

                            {/* Avatar upload button */}
                            {!user.isGoogleUser && !pendingAvatar && (
                                <label className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[var(--brand-primary)] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                    <FiCamera
                                        size={16}
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
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2"
                                    >
                                        <button
                                            onClick={() =>
                                                setPendingAvatar(null)
                                            }
                                            className="w-8 h-8 rounded-full bg-red-500 text-white shadow-lg"
                                        >
                                            <FiX
                                                size={16}
                                                className="mx-auto"
                                            />
                                        </button>
                                        <button
                                            onClick={handleAvatarUpload}
                                            disabled={uploadingAvatar}
                                            className="w-8 h-8 rounded-full bg-green-500 text-white shadow-lg"
                                        >
                                            {uploadingAvatar ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                            ) : (
                                                <FiCheck
                                                    size={16}
                                                    className="mx-auto"
                                                />
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Profile Info - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-20 text-center px-4"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        {user.fullName}
                    </h1>
                    <p className="text-[var(--text-tertiary)] mt-1">
                        @{user.userName}
                    </p>

                    {/* Member since badge */}
                    <div className="flex items-center justify-center gap-2 mt-3 text-sm text-[var(--text-secondary)]">
                        <FiCalendar size={14} />
                        <span>
                            Member for{" "}
                            {memberMonths > 0
                                ? `${memberMonths} month${
                                      memberMonths > 1 ? "s" : ""
                                  }`
                                : `${memberDays} day${
                                      memberDays !== 1 ? "s" : ""
                                  }`}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        <Link
                            to={`/channel/${user.userName}`}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-medium shadow-lg shadow-[var(--brand-primary)]/25 hover:shadow-xl transition-shadow"
                        >
                            <FiExternalLink size={16} />
                            View Public Channel
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--error)] hover:text-[var(--error)] transition-colors"
                        >
                            <FiLogOut size={16} />
                            Logout
                        </button>
                    </div>
                </motion.div>

                {/* Mobile Stats - Only on mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex justify-center gap-6 mt-6 sm:hidden px-4"
                >
                    <div className="text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                            {content.videos || 0}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Videos
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                            {stats.subscriberCount || 0}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Subscribers
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                            {stats.totalLikesReceived || 0}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Likes
                        </p>
                    </div>
                </motion.div>

                {/* Achievements Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 px-4"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <FiAward className="text-amber-500" />
                        Achievements
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {achievements.map((achievement, i) => (
                            <AchievementBadge key={i} {...achievement} />
                        ))}
                    </div>
                </motion.section>

                {/* Your Journey Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 px-4"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <FiBookOpen className="text-[var(--brand-primary)]" />
                        Your Journey
                    </h2>
                    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-6">
                        {milestones.map((milestone, i) => (
                            <JourneyMilestone
                                key={i}
                                {...milestone}
                                isLast={i === milestones.length - 1}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Quick Links */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 px-4"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiTrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--text-primary)]">
                                    Dashboard
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    View analytics
                                </p>
                            </div>
                        </Link>
                        <Link
                            to="/uservideos"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 transition-all group"
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
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 transition-all group"
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
