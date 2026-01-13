/**
 * Profile Page
 * User's own profile with stats, avatar/cover upload, and content overview
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
    FiMessageCircle,
    FiCalendar,
    FiMail,
    FiSettings,
    FiLogOut,
    FiCheck,
    FiX,
    FiUpload,
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
import { formatRelativeTime } from "../../utils";

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatItem = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-secondary)]/50">
        <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-xl font-bold text-[var(--text-primary)]">
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value || "0"}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
        </div>
    </div>
);

// ============================================================================
// IMAGE UPLOAD OVERLAY
// ============================================================================

const ImageUploadOverlay = ({ onSelect, loading, label }) => (
    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
        <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
            className="hidden"
            disabled={loading}
        />
        <div className="flex flex-col items-center gap-2 text-white">
            <FiCamera size={24} />
            <span className="text-sm font-medium">{label}</span>
        </div>
    </label>
);

// ============================================================================
// SKELETON LOADER
// ============================================================================

const ProfileSkeleton = () => (
    <div className="space-y-6">
        {/* Cover skeleton */}
        <div className="h-48 sm:h-64 skeleton rounded-2xl" />

        {/* Profile info skeleton */}
        <div className="flex flex-col sm:flex-row gap-6 -mt-16 px-6">
            <div className="w-32 h-32 skeleton rounded-full border-4 border-[var(--bg-primary)]" />
            <div className="flex-1 space-y-3 pt-4">
                <div className="h-8 w-48 skeleton rounded" />
                <div className="h-4 w-32 skeleton rounded" />
            </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 skeleton rounded-xl" />
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
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [pendingCover, setPendingCover] = useState(null);

    // Fetch dashboard data
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
            showSuccess("Cover image updated!");
        } catch (error) {
            showError(error.message || "Failed to update cover image");
        } finally {
            setUploadingCover(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
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

    if (!user) {
        return null;
    }

    const stats = dashboardData?.stats || {};
    const content = dashboardData?.content || {};

    return (
        <PageTransition className="min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Cover Image */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]"
                >
                    {(pendingCover || user.coverImage) && (
                        <img
                            src={
                                pendingCover
                                    ? URL.createObjectURL(pendingCover)
                                    : user.coverImage
                            }
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {!user.isGoogleUser && (
                        <ImageUploadOverlay
                            onSelect={setPendingCover}
                            loading={uploadingCover}
                            label="Change cover"
                        />
                    )}

                    {/* Pending cover actions */}
                    <AnimatePresence>
                        {pendingCover && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-4 right-4 flex gap-2"
                            >
                                <button
                                    onClick={() => setPendingCover(null)}
                                    disabled={uploadingCover}
                                    className="p-2 rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                                <button
                                    onClick={handleCoverUpload}
                                    disabled={uploadingCover}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
                                >
                                    {uploadingCover ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FiCheck size={18} />
                                            Save
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Profile Header */}
                <div className="relative px-4 sm:px-6 pb-6">
                    {/* Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative -mt-16 sm:-mt-20 mb-4"
                    >
                        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[var(--bg-primary)] overflow-hidden bg-[var(--bg-elevated)]">
                            <img
                                src={
                                    pendingAvatar
                                        ? URL.createObjectURL(pendingAvatar)
                                        : user.avatar
                                }
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                            />

                            {!user.isGoogleUser && (
                                <ImageUploadOverlay
                                    onSelect={setPendingAvatar}
                                    loading={uploadingAvatar}
                                    label="Change"
                                />
                            )}
                        </div>

                        {/* Pending avatar actions */}
                        <AnimatePresence>
                            {pendingAvatar && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute -bottom-2 left-0 flex gap-2"
                                >
                                    <button
                                        onClick={() => setPendingAvatar(null)}
                                        disabled={uploadingAvatar}
                                        className="p-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-lg"
                                    >
                                        <FiX size={16} />
                                    </button>
                                    <button
                                        onClick={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        className="p-1.5 rounded-full bg-[var(--brand-primary)] text-white shadow-lg"
                                    >
                                        {uploadingAvatar ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FiCheck size={16} />
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* User Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                                {user.fullName}
                            </h1>
                            <p className="text-[var(--text-tertiary)]">
                                @{user.userName}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1.5">
                                <FiMail
                                    size={14}
                                    className="text-[var(--text-tertiary)]"
                                />
                                {user.email}
                            </span>
                            {user.createdAt && (
                                <span className="flex items-center gap-1.5">
                                    <FiCalendar
                                        size={14}
                                        className="text-[var(--text-tertiary)]"
                                    />
                                    Joined{" "}
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/settings"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <FiSettings size={18} />
                                Settings
                            </Link>
                            <Link
                                to={`/channel/${user.userName}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
                            >
                                <HiSparkles size={18} />
                                View Channel
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                            >
                                <FiLogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-4 sm:px-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Your Stats
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatItem
                            icon={FiUsers}
                            label="Subscribers"
                            value={stats.subscriberCount}
                            color="bg-gradient-to-br from-pink-500 to-rose-600"
                        />
                        <StatItem
                            icon={FiVideo}
                            label="Videos"
                            value={content.videos}
                            color="bg-gradient-to-br from-blue-500 to-cyan-600"
                        />
                        <StatItem
                            icon={FiHeart}
                            label="Likes Received"
                            value={stats.totalLikesReceived}
                            color="bg-gradient-to-br from-red-500 to-orange-600"
                        />
                        <StatItem
                            icon={FiMessageCircle}
                            label="Comments"
                            value={stats.totalCommentsReceived}
                            color="bg-gradient-to-br from-purple-500 to-indigo-600"
                        />
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="px-4 sm:px-6 pb-8"
                >
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Link
                            to="/uservideos"
                            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 transition-colors"
                        >
                            <FiVideo className="w-5 h-5 text-[var(--brand-primary)]" />
                            <span className="font-medium text-[var(--text-primary)]">
                                Your Videos
                            </span>
                        </Link>
                        <Link
                            to="/create"
                            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 transition-colors"
                        >
                            <FiUpload className="w-5 h-5 text-[var(--brand-primary)]" />
                            <span className="font-medium text-[var(--text-primary)]">
                                Upload
                            </span>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/50 transition-colors"
                        >
                            <HiSparkles className="w-5 h-5 text-[var(--brand-primary)]" />
                            <span className="font-medium text-[var(--text-primary)]">
                                Dashboard
                            </span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Profile;
