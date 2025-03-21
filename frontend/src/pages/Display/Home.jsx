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
        <div className="min-h-screen bg-gray-900 text-gray-100 pt-20 md:pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Carousel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 md:mb-12 rounded-xl overflow-hidden"
                >
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        navigation
                        loop
                        className="hero-swiper"
                    >
                        {[...Array(3)].map((_, i) => (
                            <SwiperSlide key={i}>
                                <div className="relative h-[40vh] md:h-[60vh] bg-gradient-to-r from-purple-900/50 to-blue-900/50">
                                    <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                                        <div className="space-y-4">
                                            <h1 className="text-4xl md:text-6xl font-bold">
                                                Welcome to Streamify
                                            </h1>
                                            <p className="text-lg md:text-xl text-gray-300">
                                                Discover amazing content from
                                                creators worldwide
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>

                {/* Video Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-bold">
                            Trending Now
                        </h2>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-xl">
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {isLoading
                            ? [...Array(8)].map((_, i) => (
                                  <motion.div
                                      key={i}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                  >
                                      <VideoCardSkeleton />
                                  </motion.div>
                              ))
                            : videos.map((video, index) => (
                                  <motion.div
                                      key={video._id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                  >
                                      <VideoCard video={video} />
                                  </motion.div>
                              ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Video Card Component
// Update VideoCard component
const VideoCard = ({ video }) => (
    <Link to={`/video/${video._id}`} className="...">
        <div className="relative aspect-video">
            <img
                src={video.thumbnail?.url || "/default-thumbnail.jpg"}
                alt={video.title}
                className="..."
            />
            {/* ... */}
        </div>
        <div className="p-4 space-y-2">
            <h3 className="...">{video.title}</h3>
            {/* ... */}
            {video.owner && (
                <div className="...">
                    <img
                        src={video.owner.avatar || "/default-avatar.png"}
                        alt={video.owner.userName}
                        className="..."
                    />
                    <span className="...">
                        {video.owner.userName}
                    </span>
                </div>
            )}
        </div>
    </Link>
);

// VideoCardSkeleton Component
const VideoCardSkeleton = () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700/50 transition-colors">
        <div className="aspect-video bg-gray-700 animate-pulse" />
        <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse" />
        </div>
    </div>
);

export default Home;
