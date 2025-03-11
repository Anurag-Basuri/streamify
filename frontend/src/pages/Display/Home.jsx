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
        <div className="min-h-screen bg-gray-900 text-gray-100 pt-20 md:pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Section */}
                <Swiper className="mb-8 md:mb-12 rounded-xl md:rounded-2xl overflow-hidden">
                    <SwiperSlide>
                        <div className="relative h-[40vh] md:h-[50vh]">
                            <div className="text-center p-4 md:p-8">
                                <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                                    Welcome to StreamIfy
                                </h1>
                                <p className="text-sm md:text-xl mb-4 md:mb-8">
                                    Discover amazing content
                                </p>
                                <Link
                                    to="/create"
                                    className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
                                >
                                    Start Creating
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>

                {/* Video Grid */}
                <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
                    Trending
                </h2>

                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {loading
                        ? [...Array(8)].map((_, i) => (
                              <SkeletonLoader key={i} />
                          ))
                        : videos.map((video) => (
                              <VideoCard
                                  key={video._id}
                                  video={video}
                                  className="hover:scale-[1.02] transition-transform"
                              />
                          ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
