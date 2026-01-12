import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSend,
    FiHeart,
    FiMessageCircle,
    FiShare2,
    FiMoreHorizontal,
    FiTrash2,
    FiEdit3,
    FiCopy,
    FiRefreshCw,
    FiSmile,
    FiImage,
    FiX,
    FiCheck,
    FiAlertCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import useAuth from "../../hooks/useAuth";
import { PageTransition, EmptyState } from "../../components/Common";
import {
    showError,
    showSuccess,
    showInfo,
} from "../../components/Common/ToastProvider";
import {
    getTweets,
    createTweet,
    deleteTweet,
    updateTweet,
} from "../../services";
import { toggleTweetLike } from "../../services/likeService";
import { formatRelativeTime } from "../../utils";

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_TWEET_LENGTH = 280;

// ============================================================================
// TWEET COMPOSER
// ============================================================================

const TweetComposer = ({ user, onSubmit, isPosting }) => {
    const [content, setContent] = useState("");
    const textareaRef = useRef(null);

    const remaining = MAX_TWEET_LENGTH - content.length;
    const isOverLimit = remaining < 0;
    const canSubmit = content.trim().length > 0 && !isOverLimit && !isPosting;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        await onSubmit(content);
        setContent("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleTextChange = (e) => {
        setContent(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const getProgressColor = () => {
        if (remaining < 0) return "stroke-[var(--error)]";
        if (remaining <= 20) return "stroke-yellow-500";
        return "stroke-[var(--brand-primary)]";
    };

    const progressPercent = Math.min(
        (content.length / MAX_TWEET_LENGTH) * 100,
        100
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-4 sm:p-5 shadow-lg"
        >
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.userName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[var(--brand-primary)]/20"
                            />
                        ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                    {user?.userName?.charAt(0)?.toUpperCase() ||
                                        "?"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 min-w-0">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleTextChange}
                            placeholder="What's happening?"
                            rows={2}
                            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-base sm:text-lg resize-none outline-none min-h-[60px] max-h-[300px]"
                        />

                        {/* Actions Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--divider)] mt-3">
                            {/* Media buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className="p-2 rounded-full text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
                                    title="Add image (coming soon)"
                                >
                                    <FiImage size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 rounded-full text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
                                    title="Add emoji (coming soon)"
                                >
                                    <FiSmile size={20} />
                                </button>
                            </div>

                            {/* Submit area */}
                            <div className="flex items-center gap-3">
                                {/* Character count */}
                                {content.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {remaining <= 20 && (
                                            <span
                                                className={`text-sm font-medium ${
                                                    isOverLimit
                                                        ? "text-[var(--error)]"
                                                        : "text-yellow-500"
                                                }`}
                                            >
                                                {remaining}
                                            </span>
                                        )}
                                        <svg className="w-6 h-6 -rotate-90">
                                            <circle
                                                className="stroke-[var(--bg-tertiary)]"
                                                strokeWidth="2"
                                                fill="transparent"
                                                r="10"
                                                cx="12"
                                                cy="12"
                                            />
                                            <circle
                                                className={`${getProgressColor()} transition-all`}
                                                strokeWidth="2"
                                                fill="transparent"
                                                r="10"
                                                cx="12"
                                                cy="12"
                                                strokeDasharray={`${
                                                    (progressPercent / 100) *
                                                    62.83
                                                } 62.83`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                )}

                                {/* Submit button */}
                                <motion.button
                                    type="submit"
                                    disabled={!canSubmit}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                                        canSubmit
                                            ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] shadow-lg shadow-[var(--brand-primary)]/25"
                                            : "bg-[var(--brand-primary)]/50 text-white/50 cursor-not-allowed"
                                    }`}
                                >
                                    {isPosting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <HiSparkles size={16} />
                                            Post
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

// ============================================================================
// TWEET OPTIONS MENU
// ============================================================================

const TweetOptionsMenu = ({ tweet, isOwner, onEdit, onDelete, onClose }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(tweet.content);
        showSuccess("Copied to clipboard");
        onClose();
    };

    const handleShare = () => {
        const url = `${window.location.origin}/tweet/${tweet._id}`;
        navigator.clipboard.writeText(url);
        showSuccess("Link copied!");
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-elevated)] rounded-xl shadow-xl border border-[var(--border-light)] overflow-hidden z-20"
        >
            <button
                onClick={handleCopy}
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 transition-colors"
            >
                <FiCopy size={16} />
                Copy text
            </button>
            <button
                onClick={handleShare}
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 transition-colors"
            >
                <FiShare2 size={16} />
                Share link
            </button>
            {isOwner && (
                <>
                    <div className="border-t border-[var(--divider)]" />
                    <button
                        onClick={onEdit}
                        className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 transition-colors"
                    >
                        <FiEdit3 size={16} />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-full px-4 py-2.5 text-left text-sm text-[var(--error)] hover:bg-[var(--error)]/10 flex items-center gap-3 transition-colors"
                    >
                        <FiTrash2 size={16} />
                        Delete
                    </button>
                </>
            )}
        </motion.div>
    );
};

// ============================================================================
// TWEET CARD
// ============================================================================

const TweetCard = ({
    tweet,
    currentUserId,
    onLike,
    onDelete,
    onUpdate,
    index = 0,
}) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(tweet.content);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef(null);

    const isOwner = currentUserId === tweet.owner?._id;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            await onLike(tweet._id);
        } finally {
            setIsLiking(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(tweet.content);
        setShowMenu(false);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim() || editContent === tweet.content) {
            setIsEditing(false);
            return;
        }
        try {
            await onUpdate(tweet._id, editContent);
            setIsEditing(false);
        } catch (error) {
            showError("Failed to update");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        setIsDeleting(true);
        setShowMenu(false);
        try {
            await onDelete(tweet._id);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.03 }}
            className={`bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-4 sm:p-5 hover:border-[var(--brand-primary)]/30 transition-all ${
                isDeleting ? "opacity-50" : ""
            }`}
        >
            <div className="flex gap-3 sm:gap-4">
                {/* Avatar */}
                <Link
                    to={`/channel/${tweet.owner?.userName}`}
                    className="flex-shrink-0"
                >
                    {tweet.owner?.avatar ? (
                        <img
                            src={tweet.owner.avatar}
                            alt={tweet.owner.userName}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-transparent hover:ring-[var(--brand-primary)] transition-all"
                        />
                    ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                                {tweet.owner?.fullName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
                                <Link
                                    to={`/channel/${tweet.owner?.userName}`}
                                    className="font-semibold text-[var(--text-primary)] hover:underline truncate"
                                >
                                    {tweet.owner?.fullName || "Anonymous"}
                                </Link>
                                <span className="text-sm text-[var(--text-tertiary)]">
                                    @{tweet.owner?.userName || "unknown"}
                                </span>
                                <span className="text-[var(--text-tertiary)]">
                                    ·
                                </span>
                                <span className="text-sm text-[var(--text-tertiary)]">
                                    {formatRelativeTime(tweet.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Options Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                            >
                                <FiMoreHorizontal size={18} />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <TweetOptionsMenu
                                        tweet={tweet}
                                        isOwner={isOwner}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onClose={() => setShowMenu(false)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Tweet Content */}
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-3 rounded-xl border border-[var(--border-light)] focus:border-[var(--brand-primary)] outline-none resize-none min-h-[80px]"
                                maxLength={MAX_TWEET_LENGTH}
                            />
                            <div className="flex items-center justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-1.5 rounded-full text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-1.5 rounded-full text-sm bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors flex items-center gap-1"
                                >
                                    <FiCheck size={14} />
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-2 text-[var(--text-primary)] text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                            {tweet.content}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-4 text-[var(--text-tertiary)]">
                        {/* Comment */}
                        <button className="flex items-center gap-1.5 hover:text-[var(--brand-primary)] transition-colors group">
                            <div className="p-1.5 rounded-full group-hover:bg-[var(--brand-primary)]/10 transition-colors">
                                <FiMessageCircle size={18} />
                            </div>
                            <span className="text-sm">
                                {tweet.commentsCount || 0}
                            </span>
                        </button>

                        {/* Like */}
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-1.5 transition-colors group ${
                                tweet.isLiked
                                    ? "text-pink-500"
                                    : "hover:text-pink-500"
                            }`}
                        >
                            <motion.div
                                whileTap={{ scale: 1.2 }}
                                className={`p-1.5 rounded-full transition-colors ${
                                    tweet.isLiked
                                        ? "bg-pink-500/10"
                                        : "group-hover:bg-pink-500/10"
                                }`}
                            >
                                <FiHeart
                                    size={18}
                                    className={
                                        tweet.isLiked ? "fill-current" : ""
                                    }
                                />
                            </motion.div>
                            <span className="text-sm">{tweet.likes || 0}</span>
                        </button>

                        {/* Share */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${window.location.origin}/tweet/${tweet._id}`
                                );
                                showSuccess("Link copied!");
                            }}
                            className="flex items-center gap-1.5 hover:text-[var(--brand-primary)] transition-colors group"
                        >
                            <div className="p-1.5 rounded-full group-hover:bg-[var(--brand-primary)]/10 transition-colors">
                                <FiShare2 size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

// ============================================================================
// TWEET SKELETON
// ============================================================================

const TweetSkeleton = () => (
    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 skeleton rounded-full" />
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 skeleton rounded w-24" />
                    <div className="h-3 skeleton rounded w-16" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 skeleton rounded w-full" />
                    <div className="h-4 skeleton rounded w-3/4" />
                </div>
                <div className="flex gap-6 pt-2">
                    <div className="h-6 w-12 skeleton rounded" />
                    <div className="h-6 w-12 skeleton rounded" />
                    <div className="h-6 w-8 skeleton rounded" />
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Tweet = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const fetchTweetsData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const data = await getTweets({ page: 1, limit: 50 });
            const tweetList = Array.isArray(data)
                ? data
                : data.docs || data.tweets || [];
            setTweets(tweetList);
        } catch (error) {
            console.error("Failed to fetch tweets:", error);
            showError("Failed to load posts");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTweetsData();
    }, [fetchTweetsData]);

    const handleCreateTweet = async (content) => {
        if (!isAuthenticated) {
            showInfo("Please login to post");
            navigate("/auth");
            return;
        }

        setIsPosting(true);
        try {
            const newTweet = await createTweet(content);
            // Add user info to the new tweet
            const tweetWithUser = {
                ...newTweet,
                owner: {
                    _id: user?._id,
                    userName: user?.userName,
                    fullName: user?.fullName,
                    avatar: user?.avatar,
                },
                isLiked: false,
                likes: 0,
                commentsCount: 0,
            };
            setTweets((prev) => [tweetWithUser, ...prev]);
            showSuccess("Posted! 🎉");
        } catch (error) {
            showError(error.message || "Failed to post");
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (tweetId) => {
        if (!isAuthenticated) {
            showInfo("Please login to like");
            navigate("/auth");
            return;
        }

        try {
            const result = await toggleTweetLike(tweetId);
            setTweets((prev) =>
                prev.map((t) =>
                    t._id === tweetId
                        ? {
                              ...t,
                              likes: result?.likes ?? t.likes,
                              isLiked: result?.state === 1,
                          }
                        : t
                )
            );
        } catch (error) {
            showError("Like action failed");
        }
    };

    const handleDelete = async (tweetId) => {
        try {
            await deleteTweet(tweetId);
            setTweets((prev) => prev.filter((t) => t._id !== tweetId));
            showSuccess("Post deleted");
        } catch (error) {
            showError("Failed to delete");
        }
    };

    const handleUpdate = async (tweetId, content) => {
        try {
            await updateTweet(tweetId, content);
            setTweets((prev) =>
                prev.map((t) => (t._id === tweetId ? { ...t, content } : t))
            );
            showSuccess("Post updated");
        } catch (error) {
            showError("Failed to update");
            throw error;
        }
    };

    const handleRefresh = () => {
        fetchTweetsData(true);
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <HiSparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                                Community
                            </h1>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                Share your thoughts
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Refresh"
                    >
                        <FiRefreshCw
                            size={20}
                            className={refreshing ? "animate-spin" : ""}
                        />
                    </button>
                </motion.div>

                {/* Composer */}
                {isAuthenticated ? (
                    <div className="mb-6">
                        <TweetComposer
                            user={user}
                            onSubmit={handleCreateTweet}
                            isPosting={isPosting}
                        />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] text-center"
                    >
                        <FiAlertCircle
                            size={24}
                            className="mx-auto text-[var(--text-tertiary)] mb-2"
                        />
                        <p className="text-[var(--text-secondary)] mb-3">
                            Sign in to share your thoughts
                        </p>
                        <button
                            onClick={() => navigate("/auth")}
                            className="px-6 py-2 bg-[var(--brand-primary)] text-white rounded-full font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
                        >
                            Sign In
                        </button>
                    </motion.div>
                )}

                {/* Tweets Feed */}
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TweetSkeleton key={i} />
                        ))
                    ) : tweets.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-12"
                        >
                            <EmptyState
                                icon={HiSparkles}
                                title="No posts yet"
                                description="Be the first to share something with the community!"
                                actionLabel={
                                    isAuthenticated ? null : "Sign in to post"
                                }
                                action={
                                    isAuthenticated
                                        ? null
                                        : () => navigate("/auth")
                                }
                            />
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {tweets.map((tweet, index) => (
                                <TweetCard
                                    key={tweet._id}
                                    tweet={tweet}
                                    currentUserId={user?._id}
                                    onLike={handleLike}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Tweet;
