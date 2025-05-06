import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaEllipsisV } from "react-icons/fa";
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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
        >
            <div className="relative aspect-video">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                />
                <Link
                    to={`/video/${video._id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </Link>
            </div>

            <div className="p-4">
                <div>
                    <h3 className="text-lg font-semibold text-white truncate">
                        {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-400">
                            {video.owner?.username}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">
                            {video.views} views
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        {formatDistance(new Date(video.createdAt), new Date(), {
                            addSuffix: true,
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <button
                                onClick={() => onAction("like", video._id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FaHeart
                                    className={`w-5 h-5 ${
                                        video.isLiked ? "text-red-500" : ""
                                    }`}
                                />
                            </button>
                        )}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <FaEllipsisV className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden"
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
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center justify-between disabled:opacity-50"
                                                >
                                                    {inWatchLater
                                                        ? "Remove from Watch Later"
                                                        : "Add to Watch Later"}
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
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
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
                                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                                        >
                                            Share
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
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
