import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPlay, FaEye, FaClock } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch random videos from the backend
    useEffect(() => {
        const fetchRandomVideos = async () => {
            try {
                const response = await axios.get("/api/v1/videos/home");
                if (!response.data.success) {
                    throw new Error("Failed to fetch videos");
                }
                setVideos(response.data.data.videos);
            } catch (err) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomVideos();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 rounded-2xl overflow-hidden border border-gray-700/50 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm"
                >
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        navigation={{
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        }}
                        loop
                        className="relative group"
                    >
                        {[...Array(3)].map((_, i) => (
                            <SwiperSlide key={i}>
                                <div className="relative h-[50vh] md:h-[70vh]">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                                    <div className="absolute inset-0 flex items-end justify-center text-center p-8 pb-16">
                                        <div className="space-y-4 max-w-2xl">
                                            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                                Welcome to Streamify
                                            </h1>
                                            <p className="text-lg md:text-xl text-gray-300 font-light">
                                                Dive into a world of stunning
                                                video content from creative
                                                minds worldwide
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium flex items-center gap-2 mx-auto mt-4 shadow-lg hover:shadow-xl transition-shadow"
                                            >
                                                <FaPlay /> Start Exploring
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}

                        {/* Custom Navigation Arrows */}
                        <div className="swiper-button-next !text-white !w-12 !h-12 !rounded-full !bg-gray-800/50 hover:!bg-gray-800/80 transition-colors" />
                        <div className="swiper-button-prev !text-white !w-12 !h-12 !rounded-full !bg-gray-800/50 hover:!bg-gray-800/80 transition-colors" />
                    </Swiper>
                </motion.div>

                {/* Video Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Trending Now
                        </h2>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-red-500/20 border border-red-500/40 p-4 rounded-xl backdrop-blur-sm"
                        >
                            <p className="text-red-300">{error}</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading
                            ? [...Array(8)].map((_, i) => (
                                  <VideoCardSkeleton key={i} index={i} />
                              ))
                            : videos.map((video, index) => (
                                  <VideoCard
                                      key={video._id}
                                      video={video}
                                      index={index}
                                  />
                              ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const VideoCard = ({ video, index }) => {
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
        >
            <Link
                to={`/video/${video._id}`}
                className="block rounded-xl overflow-hidden bg-gray-800 hover:bg-gray-700/50 transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
                {/* Thumbnail Container */}
                <div className="relative aspect-video">
                    <img
                        src={video.thumbnail?.url || "/default-thumbnail.jpg"}
                        alt={video.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-gray-900/80 backdrop-blur-sm text-sm flex items-center gap-1.5">
                        <FaPlay className="text-purple-400" />
                        <span className="font-medium">
                            {formatDuration(video.duration)}
                        </span>
                    </div>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">
                        {video.title}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <FaEye />
                            <span>{video.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaClock />
                            <span>
                                {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-700/50">
                        <div className="shrink-0">
                            {video.owner?.avatar ? (
                                <img
                                    src={video.owner.avatar}
                                    alt={video.owner.userName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                    <FaUser className="text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {video.owner?.userName || "Unknown Creator"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                Content Creator
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const VideoCardSkeleton = ({ index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm"
    >
        <div className="aspect-video bg-gradient-to-r from-gray-800 to-gray-700/50 animate-pulse" />
        <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-700 rounded w-4/5 animate-pulse" />
            <div className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
            </div>
            <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                <div className="space-y-1 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
            </div>
        </div>
    </motion.div>
);

export default Home;
