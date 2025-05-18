import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaEllipsisV, FaUser, FaClock } from "react-icons/fa";
import { formatDistance } from "date-fns";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const VideoCard = ({
    video,
    onAction,
    inWatchLater,
    watchLaterLoading,
    isAuthenticated,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all group relative"
        >
            {/* Thumbnail Section */}
            <div className="relative aspect-video">
                <img
                    src={video.thumbnail.url}
                    alt={video.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-gray-900/80 text-xs font-medium text-white rounded-md">
                    {formatVideoDuration(video.duration)}
                </span>

                <Link
                    to={`/video/${video._id}`}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                        <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </motion.div>
                </Link>
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
                                className="w-8 h-8 rounded-full object-cover"
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
                                {
                                    addSuffix: true,
                                }
                            )}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <button
                                onClick={() => onAction("like", video._id)}
                                className="p-2 hover:text-red-500 transition-colors relative group"
                            >
                                <FaHeart
                                    className={`w-5 h-5 ${
                                        video.isLiked
                                            ? "text-red-500 fill-current"
                                            : ""
                                    }`}
                                />
                                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
                                    {video.likes}
                                </div>
                            </button>
                        )}

                        {/* Context Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
                            >
                                <FaEllipsisV className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden border border-gray-700"
                                    >
                                        {isAuthenticated && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        onAction(
                                                            "watchlater",
                                                            video._id
                                                        );
                                                        setIsMenuOpen(false);
                                                    }}
                                                    disabled={watchLaterLoading}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center justify-between gap-2 transition-colors"
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
                                                    onClick={() => {
                                                        onAction(
                                                            "playlist",
                                                            video._id
                                                        );
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                                >
                                                    Add to Playlist
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                onAction("share", video._id);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors border-t border-gray-700"
                                        >
                                            Share Video
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {video.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs font-medium bg-gray-700/50 text-gray-300 rounded-full"
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