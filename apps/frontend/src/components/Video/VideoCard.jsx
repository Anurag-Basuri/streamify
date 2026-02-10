/**
 * VideoCard Component
 * Responsive video card with CSS variables for theming
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEllipsisV, FaUser, FaClock } from "react-icons/fa";
import { formatDistance } from "date-fns";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const VideoCard = ({
    video,
    onAction,
    inWatchLater,
    watchLaterLoading,
    isAuthenticated,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatVideoDuration = (seconds) => {
        const duration = {
            minutes: Math.floor(seconds / 60),
            seconds: Math.floor(seconds % 60),
        };
        return `${duration.minutes}:${duration.seconds
            .toString()
            .padStart(2, "0")}`;
    };

    const handleCardClick = (e) => {
        if (
            e.target.closest(".context-menu") ||
            e.target.closest(".context-btn")
        ) {
            return;
        }
        navigate(`/video/${video._id}`);
    };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--card-bg)] rounded-xl sm:rounded-2xl overflow-hidden 
                shadow-lg hover:shadow-xl transition-all duration-300 group relative cursor-pointer 
                border border-[var(--card-border)] hover:border-[var(--brand-primary)]"
            onClick={handleCardClick}
            tabIndex={0}
            onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleCardClick(e)
            }
        >
            {/* Thumbnail Section */}
            <div className="relative aspect-video">
                <img
                    src={video.thumbnail.url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    draggable={false}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 sm:py-1 bg-black/80 text-[10px] sm:text-xs font-semibold text-white rounded-md">
                    {formatVideoDuration(video.duration)}
                </span>

                {/* Play Button Overlay - Hidden on touch devices for better UX */}
                <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[var(--brand-primary)]/80 hover:bg-[var(--brand-primary)] rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {/* Title */}
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--text-primary)] line-clamp-2 leading-tight">
                    {video.title}
                </h3>

                {/* Owner Info */}
                <div
                    className="flex items-center gap-2 sm:gap-3 cursor-pointer group/owner"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/channel/${video.owner?.userName}`);
                    }}
                >
                    <div className="flex-shrink-0">
                        {video.owner?.avatar ? (
                            <img
                                src={video.owner.avatar}
                                alt={video.owner.userName}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[var(--brand-primary)] group-hover/owner:border-[var(--brand-primary-hover)] transition-colors"
                            />
                        ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                                <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-tertiary)]" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate group-hover/owner:text-[var(--brand-primary)] transition-colors">
                            {video.owner?.userName}
                        </span>
                        <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">
                            {video.views} views
                        </span>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                        <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
                            {formatDistance(
                                new Date(video.createdAt),
                                new Date(),
                                { addSuffix: true }
                            )}
                        </span>
                    </div>

                    {/* Context Menu */}
                    <div className="relative context-menu" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="p-1.5 sm:p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors context-btn"
                            aria-label="Open menu"
                        >
                            <FaEllipsisV className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 bottom-full mb-2 w-44 sm:w-52 bg-[var(--bg-elevated)] rounded-lg shadow-xl z-20 overflow-hidden border border-[var(--border-light)]"
                                >
                                    {isAuthenticated && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAction(
                                                        "watchlater",
                                                        video._id
                                                    );
                                                    setIsMenuOpen(false);
                                                }}
                                                disabled={watchLaterLoading}
                                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center justify-between gap-2 transition-colors"
                                            >
                                                <span>
                                                    {inWatchLater
                                                        ? "Remove from Watch Later"
                                                        : "Add to Watch Later"}
                                                </span>
                                                {watchLaterLoading && (
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAction(
                                                        "playlist",
                                                        video._id
                                                    );
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                            >
                                                Add to Playlist
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAction("share", video._id);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors border-t border-[var(--divider)]"
                                    >
                                        Share Video
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Tags - Hidden on small screens */}
                {video.tags?.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1.5 sm:gap-2">
                        {video.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.article>
    );
};

VideoCard.propTypes = {
    video: PropTypes.object.isRequired,
    onAction: PropTypes.func.isRequired,
    inWatchLater: PropTypes.bool,
    watchLaterLoading: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
};

export default VideoCard;
