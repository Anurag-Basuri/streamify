import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const Home = () => {
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
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Trending Now
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <VideoCardSkeleton />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

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
