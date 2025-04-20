import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClockIcon, TrashIcon, PlayIcon } from "@heroicons/react/24/outline";
import {
    PlayCircleIcon,
    DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import emptyStateIllustration from "../../assets/watch-later-empty.svg";
import { AuthContext } from "../../services/AuthContext.jsx";
import axios from "axios";

const Watchlater = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    const [state, setState] = useState({
        videos: [],
        loading: true,
        error: null,
        removingVideo: null,
    });

    const fetchWatchLater = useCallback(async () => {
        if (!user?.accessToken) return;

        try {
            const { data } = await axios.get("/api/v1/watchlater", {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            setState((prev) => ({
                ...prev,
                videos: data.data?.videos || [],
                loading: false,
                error: null,
            }));
        } catch (err) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error:
                    err.response?.data?.message ||
                    "Failed to fetch watch later videos",
            }));
        }
    }, [user?.accessToken]);

    const handleRemove = async (videoId) => {
        if (!user?.accessToken) return;

        try {
            setState((prev) => ({ ...prev, removingVideo: videoId }));
            await axios.delete(`/api/v1/watchlater/${videoId}`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            setState((prev) => ({
                ...prev,
                videos: prev.videos.filter((video) => video._id !== videoId),
                removingVideo: null,
            }));
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err.response?.data?.message || "Failed to remove video",
                removingVideo: null,
            }));
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        fetchWatchLater();
    }, [isAuthenticated, navigate, fetchWatchLater]);

    if (state.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-200 rounded-full w-48" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-xl shadow-lg"
                                >
                                    <div className="aspect-video bg-gray-200 rounded-t-xl" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
            >
                <div className="max-w-md text-center bg-red-50 p-8 rounded-2xl shadow-lg">
                    <DocumentMagnifyingGlassIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-red-500 mb-6">{state.error}</p>
                    <button
                        onClick={() =>
                            setState((prev) => ({
                                ...prev,
                                error: null,
                                loading: true,
                            }))
                        }
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
        >
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                        <ClockIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Watch Later
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {state.videos.length} saved{" "}
                            {state.videos.length === 1 ? "video" : "videos"}
                        </p>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {state.videos.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-12 bg-white rounded-2xl shadow-sm"
                        >
                            <img
                                src={emptyStateIllustration}
                                alt="Empty watch later"
                                className="w-64 mx-auto mb-8"
                            />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Your Time Capsule Awaits
                            </h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Save videos you want to watch later and
                                they&apos;ll appear here. Curate your perfect
                                viewing experience!
                            </p>
                            <Link
                                to="/videos"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl 
                                hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg"
                            >
                                <PlayCircleIcon className="w-5 h-5" />
                                Explore Trending Videos
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="videos"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {state.videos.map((video, index) => (
                                <motion.div
                                    key={video._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all 
                                    duration-300 transform hover:-translate-y-2 group relative"
                                >
                                    <div className="relative aspect-video rounded-t-xl overflow-hidden">
                                        <img
                                            src={video.thumbnail?.url}
                                            alt={video.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 
                                            transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                                                {video.duration}
                                            </div>
                                        </div>
                                        <div
                                            className="absolute inset-0 flex items-center justify-center opacity-0 
                                        group-hover:opacity-100 transition-opacity"
                                        >
                                            <PlayIcon className="w-16 h-16 text-white drop-shadow-lg" />
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link
                                                to={`/video/${video._id}`}
                                                className="font-bold text-gray-900 hover:text-blue-600 line-clamp-2 
                                                text-lg leading-tight"
                                            >
                                                {video.title}
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    setState((prev) => ({
                                                        ...prev,
                                                        removingVideo:
                                                            video._id,
                                                    }))
                                                }
                                                className="text-gray-400 hover:text-red-600 p-1 -mt-1 -mr-1 
                                                transition-colors"
                                                aria-label="Remove from watch later"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3">
                                            <Link
                                                to={`/channel/${video.owner?._id}`}
                                                className="flex items-center gap-2 group shrink-0"
                                            >
                                                <img
                                                    src={video.owner?.avatar}
                                                    alt={video.owner?.userName}
                                                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                                />
                                            </Link>
                                            <div className="min-w-0">
                                                <Link
                                                    to={`/channel/${video.owner?._id}`}
                                                    className="text-sm font-medium text-gray-900 truncate 
                                                    hover:text-blue-600"
                                                >
                                                    {video.owner?.userName}
                                                </Link>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {video.views} views •{" "}
                                                    {video.createdAt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {state.removingVideo === video._id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-black/50 rounded-xl flex items-center 
                                                justify-center p-4 backdrop-blur-sm"
                                            >
                                                <div className="bg-white p-6 rounded-lg text-center">
                                                    <h3 className="font-bold text-lg mb-4">
                                                        Remove from Watch Later?
                                                    </h3>
                                                    <div className="flex gap-4 justify-center">
                                                        <button
                                                            onClick={() =>
                                                                setState(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        removingVideo:
                                                                            null,
                                                                    })
                                                                )
                                                            }
                                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 
                                                            transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleRemove(
                                                                    video._id
                                                                )
                                                            }
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg 
                                                            hover:bg-red-700 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Watchlater;
