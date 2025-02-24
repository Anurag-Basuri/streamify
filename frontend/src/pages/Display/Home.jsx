import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import VideoCard from "../../components/VideoCard.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add actual API call
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch("/api/v1/videos?limit=12");
                const data = await res.json();
                if (data.success) setVideos(data.data.videos);
            } catch (err) {
                setError("Failed to fetch videos");
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    autoplay={{ delay: 5000 }}
                    className="mb-16 rounded-2xl overflow-hidden shadow-xl"
                >
                    <SwiperSlide>
                        <div className="relative h-96 bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                            <div className="text-center z-10 p-8">
                                <h1 className="text-5xl font-bold mb-4">
                                    Welcome to StreamIfy
                                </h1>
                                <p className="text-xl text-gray-200 mb-8">
                                    Discover amazing content from creators
                                    worldwide
                                </p>
                                <Link
                                    to="/create"
                                    className="inline-flex items-center bg-white/20 backdrop-blur-sm px-8 py-3 rounded-lg hover:bg-white/30 transition-all"
                                >
                                    Start Creating
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>

                {/* Video Grid */}
                <h2 className="text-3xl font-bold mb-8">Trending Videos</h2>
                {error && (
                    <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading
                        ? [...Array(8)].map((_, i) => (
                              <SkeletonLoader key={i} />
                          ))
                        : videos.map((video) => (
                              <VideoCard
                                  key={video._id}
                                  video={video}
                                  className="hover:scale-[1.02] transition-transform duration-300"
                              />
                          ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
