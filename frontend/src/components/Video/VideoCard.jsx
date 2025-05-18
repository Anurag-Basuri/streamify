import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEllipsisV, FaUser, FaClock } from "react-icons/fa";
import { formatDistance } from "date-fns";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

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

    // Make the whole card clickable
    const handleCardClick = (e) => {
        // Prevent click if menu or context button is clicked
        if (
            e.target.closest(".context-menu") ||
            e.target.closest(".context-btn")
        ) {
            return;
        }
        navigate(`/video/${video._id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group relative cursor-pointer border border-gray-800 hover:border-purple-500"
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
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-xs font-semibold text-white rounded-md shadow">
                    {formatVideoDuration(video.duration)}
                </span>

                {/* Play Button Overlay */}
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Play video"
                >
                    <div className="w-16 h-16 bg-purple-600/80 hover:bg-purple-700/90 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
                    {video.title}
                </h3>

                {/* Owner Info */}
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        {video.owner?.avatar ? (
                            <img
                                src={video.owner.avatar}
                                alt={video.owner.userName}
                                className="w-8 h-8 rounded-full object-cover border-2 border-purple-500"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                <FaUser className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-100">
                            {video.owner?.userName}
                        </span>
                        <span className="text-xs text-gray-400">
                            {video.views} views
                        </span>
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-2 text-sm">
                        <FaClock className="w-4 h-4" />
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
                            className="p-2 hover:bg-gray-700/50 rounded-full transition-colors context-btn"
                            aria-label="Open menu"
                        >
                            <FaEllipsisV className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-52 bg-gray-900 rounded-lg shadow-xl z-10 overflow-hidden border border-gray-700"
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
                                                className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 flex items-center justify-between gap-2 transition-colors"
                                            >
                                                <span>
                                                    {inWatchLater
                                                        ? "Remove from Watch Later"
                                                        : "Add to Watch Later"}
                                                </span>
                                                {watchLaterLoading && (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                                                className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors"
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
                                        className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors border-t border-gray-700"
                                    >
                                        Share Video
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Tags */}
                {video.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs font-medium bg-purple-700/30 text-purple-200 rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
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