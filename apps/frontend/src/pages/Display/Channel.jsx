/**
 * Channel Page - Public profile view for any user
 * Shows profile info, follow/subscribe buttons, and content tabs
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUsers,
    FiVideo,
    FiMessageSquare,
    FiCalendar,
    FiUserPlus,
    FiUserCheck,
    FiBell,
    FiBellOff,
    FiGrid,
    FiList,
    FiPlay,
    FiHeart,
    FiEye,
    FiArrowLeft,
} from "react-icons/fi";
import { api } from "../../services/api";
import { USERS } from "../../constants/api.constants";
import { toggleFollow, checkFollow } from "../../services/followService";
import {
    toggleSubscription,
    checkSubscription,
} from "../../services/subscriptionService";
import useAuth from "../../hooks/useAuth";
import { PageTransition } from "../../components/Common";
import {
    showError,
    showSuccess,
} from "../../components/Common/ToastProvider.jsx";

// ============================================================================
// CHANNEL HEADER
// ============================================================================

const ChannelHeader = ({
    profile,
    isFollowing,
    isSubscribed,
    onFollowToggle,
    onSubscribeToggle,
    isOwnProfile,
    isAuthenticated,
    followLoading,
    subscribeLoading,
}) => {
    const joinDate = profile.createdAt
        ? new Date(profile.createdAt)
        : new Date();

    return (
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
            {/* Cover */}
            <div className="relative h-32 sm:h-48 md:h-56">
                {profile.coverImage ? (
                    <img
                        src={profile.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="relative px-4 sm:px-6 pb-6">
                {/* Avatar */}
                <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-[var(--bg-elevated)] overflow-hidden bg-[var(--bg-tertiary)] shadow-xl">
                        <img
                            src={profile.avatar || "/default-avatar.png"}
                            alt={profile.fullName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Name & Actions */}
                <div className="pt-14 sm:pt-20 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                            {profile.fullName}
                        </h1>
                        <p className="text-sm text-[var(--text-tertiary)]">
                            @{profile.userName}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-tertiary)]">
                            <FiCalendar size={12} />
                            Joined{" "}
                            {joinDate.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!isOwnProfile && (
                        <div className="flex flex-wrap gap-2">
                            {/* Follow Button (Social) */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onFollowToggle}
                                disabled={followLoading || !isAuthenticated}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isFollowing
                                        ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-light)]"
                                        : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                                }`}
                            >
                                {followLoading ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isFollowing ? (
                                    <FiUserCheck size={16} />
                                ) : (
                                    <FiUserPlus size={16} />
                                )}
                                {isFollowing ? "Following" : "Follow"}
                            </motion.button>

                            {/* Subscribe Button (Videos) */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onSubscribeToggle}
                                disabled={subscribeLoading || !isAuthenticated}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isSubscribed
                                        ? "bg-red-500/10 text-red-500 border border-red-500/30"
                                        : "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                }`}
                            >
                                {subscribeLoading ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isSubscribed ? (
                                    <FiBellOff size={16} />
                                ) : (
                                    <FiBell size={16} />
                                )}
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </motion.button>
                        </div>
                    )}

                    {isOwnProfile && (
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Edit Profile
                        </Link>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border-light)]">
                    <StatCard
                        icon={FiUsers}
                        value={profile.followersCount || 0}
                        label="Followers"
                        color="purple"
                    />
                    <StatCard
                        icon={FiBell}
                        value={profile.subscribersCount || 0}
                        label="Subscribers"
                        color="red"
                    />
                    <StatCard
                        icon={FiVideo}
                        value={profile.videosCount || 0}
                        label="Videos"
                        color="blue"
                    />
                    <StatCard
                        icon={FiMessageSquare}
                        value={profile.tweetsCount || 0}
                        label="Posts"
                        color="green"
                    />
                </div>

                {/* Additional Stats (smaller) */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
                    <span>
                        <strong className="text-[var(--text-secondary)]">
                            {profile.followingCount || 0}
                        </strong>{" "}
                        Following
                    </span>
                    <span>
                        <strong className="text-[var(--text-secondary)]">
                            {profile.subscriptionsCount || 0}
                        </strong>{" "}
                        Subscriptions
                    </span>
                    <span>
                        <strong className="text-[var(--text-secondary)]">
                            {profile.playlistsCount || 0}
                        </strong>{" "}
                        Playlists
                    </span>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// STAT CARD
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        purple: "bg-purple-500/10 text-purple-500",
        red: "bg-red-500/10 text-red-500",
        blue: "bg-blue-500/10 text-blue-500",
        green: "bg-green-500/10 text-green-500",
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
            </div>
        </div>
    );
};

// ============================================================================
// CONTENT TABS
// ============================================================================

const ContentTabs = ({ activeTab, setActiveTab, counts }) => {
    const tabs = [
        { id: "videos", label: "Videos", icon: FiVideo, count: counts.videos },
        {
            id: "tweets",
            label: "Posts",
            icon: FiMessageSquare,
            count: counts.tweets,
        },
    ];

    return (
        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    }`}
                >
                    <tab.icon size={16} />
                    {tab.label}
                    {tab.count > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-[var(--bg-tertiary)] rounded">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

// ============================================================================
// VIDEO GRID
// ============================================================================

const VideoGrid = ({ videos, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-video bg-[var(--bg-secondary)] rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!videos?.length) {
        return (
            <div className="text-center py-12">
                <FiVideo
                    size={48}
                    className="mx-auto mb-4 text-[var(--text-tertiary)]"
                />
                <p className="text-[var(--text-secondary)]">No videos yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <Link
                    key={video._id}
                    to={`/video/${video._id}`}
                    className="group"
                >
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border-light)]"
                    >
                        <div className="relative aspect-video">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiPlay
                                        size={20}
                                        className="text-gray-900 ml-1"
                                    />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                                {formatDuration(video.duration)}
                            </div>
                        </div>
                        <div className="p-3">
                            <h3 className="font-medium text-[var(--text-primary)] line-clamp-2 text-sm">
                                {video.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
                                <span className="flex items-center gap-1">
                                    <FiEye size={12} />
                                    {video.views?.toLocaleString() || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FiHeart size={12} />
                                    {video.likesCount?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};

// ============================================================================
// TWEETS LIST
// ============================================================================

const TweetsList = ({ tweets, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-24 bg-[var(--bg-secondary)] rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!tweets?.length) {
        return (
            <div className="text-center py-12">
                <FiMessageSquare
                    size={48}
                    className="mx-auto mb-4 text-[var(--text-tertiary)]"
                />
                <p className="text-[var(--text-secondary)]">No posts yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tweets.map((tweet) => (
                <motion.div
                    key={tweet._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)]"
                >
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                        {tweet.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                            <FiHeart size={12} />
                            {tweet.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiMessageSquare size={12} />
                            {tweet.commentsCount || 0}
                        </span>
                        <span>
                            {new Date(tweet.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// ============================================================================
// HELPERS
// ============================================================================

const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// ============================================================================
// MAIN CHANNEL PAGE
// ============================================================================

const Channel = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated } = useAuth();

    // Profile state
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Relationship state
    const [isFollowing, setIsFollowing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [subscribeLoading, setSubscribeLoading] = useState(false);

    // Content state
    const [activeTab, setActiveTab] = useState("videos");
    const [videos, setVideos] = useState([]);
    const [tweets, setTweets] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);

    const isOwnProfile =
        currentUser?.userName?.toLowerCase() === username?.toLowerCase();

    // Fetch profile
    const fetchProfile = useCallback(async () => {
        if (!username) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.get(USERS.PROFILE(username));
            const profileData = response.data.data;

            setProfile(profileData);
            setIsFollowing(profileData.isFollowing || false);
            setIsSubscribed(profileData.isSubscribed || false);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err.response?.data?.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [username]);

    // Fetch content based on active tab
    const fetchContent = useCallback(async () => {
        if (!profile?._id) return;

        try {
            setContentLoading(true);

            if (activeTab === "videos") {
                const response = await api.get(
                    `/api/v1/videos/user/${profile._id}`
                );
                setVideos(response.data.data?.docs || response.data.data || []);
            } else if (activeTab === "tweets") {
                const response = await api.get(`/api/v1/tweets/${profile._id}`);
                setTweets(response.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching content:", err);
        } finally {
            setContentLoading(false);
        }
    }, [profile?._id, activeTab]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    // Handle follow toggle
    const handleFollowToggle = async () => {
        if (!isAuthenticated) {
            showError("Please sign in to follow users");
            navigate("/auth");
            return;
        }

        try {
            setFollowLoading(true);
            const result = await toggleFollow(profile._id);
            setIsFollowing(result.data.isFollowing);
            setProfile((prev) => ({
                ...prev,
                followersCount: result.data.followersCount,
            }));
            showSuccess(result.data.isFollowing ? "Following!" : "Unfollowed");
        } catch (err) {
            showError("Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    };

    // Handle subscribe toggle
    const handleSubscribeToggle = async () => {
        if (!isAuthenticated) {
            showError("Please sign in to subscribe");
            navigate("/auth");
            return;
        }

        try {
            setSubscribeLoading(true);
            const result = await toggleSubscription(profile._id);
            setIsSubscribed(result.data.isSubscribed);
            setProfile((prev) => ({
                ...prev,
                subscribersCount:
                    result.data.subscribersCount || prev.subscribersCount,
            }));
            showSuccess(
                result.data.isSubscribed ? "Subscribed!" : "Unsubscribed"
            );
        } catch (err) {
            showError("Failed to update subscription");
        } finally {
            setSubscribeLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <PageTransition>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            </PageTransition>
        );
    }

    // Error state
    if (error || !profile) {
        return (
            <PageTransition>
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <p className="text-[var(--text-secondary)]">
                        {error || "User not found"}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    >
                        <FiArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Channel Header */}
                <ChannelHeader
                    profile={profile}
                    isFollowing={isFollowing}
                    isSubscribed={isSubscribed}
                    onFollowToggle={handleFollowToggle}
                    onSubscribeToggle={handleSubscribeToggle}
                    isOwnProfile={isOwnProfile}
                    isAuthenticated={isAuthenticated}
                    followLoading={followLoading}
                    subscribeLoading={subscribeLoading}
                />

                {/* Content Tabs */}
                <ContentTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    counts={{
                        videos: profile.videosCount || 0,
                        tweets: profile.tweetsCount || 0,
                    }}
                />

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "videos" && (
                            <VideoGrid
                                videos={videos}
                                loading={contentLoading}
                            />
                        )}
                        {activeTab === "tweets" && (
                            <TweetsList
                                tweets={tweets}
                                loading={contentLoading}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default Channel;
