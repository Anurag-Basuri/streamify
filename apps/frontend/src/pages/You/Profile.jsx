/**
 * Profile Page - Your personal identity on Streamify
 * Clean, organized layout with clear sections
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    FiTrendingUp,
    FiMail,
    FiEye,
    FiEdit2,
    FiGrid,
    FiList,
    FiMessageSquare,
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
// PROFILE HEADER COMPONENT
// ============================================================================

const ProfileHeader = ({
    user,
    stats,
    pendingAvatar,
    setPendingAvatar,
    pendingCover,
    setPendingCover,
    onAvatarSave,
    onCoverSave,
    uploadingAvatar,
    uploadingCover,
}) => {
    const joinDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const memberDays = Math.floor(
        (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
            {/* Cover */}
            <div className="relative h-32 sm:h-44">
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
                    <div className="w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600" />
                )}

                {/* Cover edit */}
                {!user.isGoogleUser && (
                    <label className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 backdrop-blur text-white cursor-pointer hover:bg-black/60 transition-colors">
                        <FiCamera size={16} />
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

                {/* Pending cover save */}
                {pendingCover && (
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                            onClick={() => setPendingCover(null)}
                            className="p-2 rounded-lg bg-red-500 text-white"
                        >
                            <FiX size={16} />
                        </button>
                        <button
                            onClick={onCoverSave}
                            disabled={uploadingCover}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 text-white text-sm"
                        >
                            {uploadingCover ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiCheck size={16} />
                            )}
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="relative px-5 pb-5">
                {/* Avatar */}
                <div className="absolute -top-12 left-5">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-xl border-4 border-[var(--bg-elevated)] overflow-hidden bg-[var(--bg-tertiary)] shadow-lg">
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
                        {!user.isGoogleUser && !pendingAvatar && (
                            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform">
                                <FiEdit2 size={12} className="text-white" />
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
                        {pendingAvatar && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                <button
                                    onClick={() => setPendingAvatar(null)}
                                    className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center"
                                >
                                    <FiX size={12} />
                                </button>
                                <button
                                    onClick={onAvatarSave}
                                    disabled={uploadingAvatar}
                                    className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center"
                                >
                                    {uploadingAvatar ? (
                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiCheck size={12} />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Name & Actions */}
                <div className="pt-14 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">
                            {user.fullName}
                        </h1>
                        <p className="text-sm text-[var(--text-tertiary)]">
                            @{user.userName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
                            <span className="flex items-center gap-1">
                                <FiMail size={12} />
                                {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <FiCalendar size={12} />
                                Joined{" "}
                                {joinDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to={`/channel/${user.userName}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            <FiExternalLink size={14} />
                            Channel
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <FiSettings size={14} />
                            Settings
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-[var(--border-light)]">
                    <div className="text-center">
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                            {stats.totalViews?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Views
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                            {stats.subscriberCount || 0}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Subscribers
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                            {stats.totalLikesReceived || 0}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Likes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// CONTENT OVERVIEW COMPONENT
// ============================================================================

const ContentOverview = ({ content, stats }) => {
    const items = [
        {
            icon: FiVideo,
            label: "Videos",
            value: content.videos || 0,
            color: "text-blue-500",
            link: "/uservideos",
        },
        {
            icon: FiHeart,
            label: "Liked",
            value: content.watchLater || 0,
            color: "text-pink-500",
            link: "/likedvideos",
        },
        {
            icon: FiUsers,
            label: "Following",
            value: stats.subscriptionCount || 0,
            color: "text-purple-500",
            link: "/subscriptions",
        },
        {
            icon: FiList,
            label: "Playlists",
            value: 0,
            color: "text-green-500",
            link: "/playlist",
        },
        {
            icon: FiMessageSquare,
            label: "Posts",
            value: content.tweets || 0,
            color: "text-violet-500",
            link: "/community",
        },
    ];

    return (
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                Your Content
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                    <Link
                        key={item.label}
                        to={item.link}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {item.value}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                {item.label}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================

const QuickActions = ({ onLogout }) => {
    const actions = [
        {
            icon: FiTrendingUp,
            label: "Dashboard",
            desc: "View analytics",
            link: "/dashboard",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: FiVideo,
            label: "Upload",
            desc: "New video",
            link: "/create",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: FiGrid,
            label: "Studio",
            desc: "Manage content",
            link: "/uservideos",
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                Quick Actions
            </h2>
            <div className="space-y-2">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        to={action.link}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group"
                    >
                        <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                            <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-[var(--text-primary)]">
                                {action.label}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                {action.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            <button
                onClick={onLogout}
                className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
            >
                <FiLogOut size={16} />
                <span className="text-sm font-medium">Sign Out</span>
            </button>
        </div>
    );
};

// ============================================================================
// ACCOUNT INFO COMPONENT
// ============================================================================

const AccountInfo = ({ user }) => {
    const joinDate = user.createdAt ? new Date(user.createdAt) : new Date();

    return (
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                Account
            </h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">
                        Username
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                        @{user.userName}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Email</span>
                    <span className="text-[var(--text-primary)]">
                        {user.email}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">
                        Member since
                    </span>
                    <span className="text-[var(--text-primary)]">
                        {joinDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">
                        Account type
                    </span>
                    <span className="text-[var(--text-primary)]">
                        {user.isGoogleUser ? "Google" : "Email"}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

const ProfileSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
            <div className="h-32 sm:h-44 bg-[var(--bg-tertiary)] animate-pulse" />
            <div className="p-5 pt-14">
                <div className="h-6 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse mt-2" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-40 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] animate-pulse" />
            <div className="h-40 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] animate-pulse" />
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

    const handleAvatarSave = async () => {
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

    const handleCoverSave = async () => {
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

    return (
        <PageTransition className="min-h-screen pb-8">
            <div className="max-w-5xl mx-auto space-y-4">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <ProfileHeader
                        user={user}
                        stats={stats}
                        pendingAvatar={pendingAvatar}
                        setPendingAvatar={setPendingAvatar}
                        pendingCover={pendingCover}
                        setPendingCover={setPendingCover}
                        onAvatarSave={handleAvatarSave}
                        onCoverSave={handleCoverSave}
                        uploadingAvatar={uploadingAvatar}
                        uploadingCover={uploadingCover}
                    />
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-4"
                    >
                        <ContentOverview content={content} stats={stats} />
                    </motion.div>

                    {/* Right Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-4"
                    >
                        <QuickActions onLogout={handleLogout} />
                        <AccountInfo user={user} />
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;
