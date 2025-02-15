import { useState, useEffect } from "react";
import axios from "axios";

function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideos = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/v1/videos");

            if (response.data && Array.isArray(response.data.videos)) {
                setVideos((prevVideos) => [
                    ...prevVideos,
                    ...response.data.videos,
                ]);

                // If the fetched array is smaller than expected, assume no more videos
                if (response.data.videos.length === 0) {
                    setHasMore(false);
                } else {
                    setPage((prevPage) => prevPage + 1);
                }
            } else {
                console.error("Invalid API response", response.data);
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Infinite scrolling logic
    const handleScroll = () => {
        if (loading || !hasMore) return;

        if (
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 100
        ) {
            fetchVideos();
        }
    };

    useEffect(() => {
        fetchVideos(); // Initial fetch on component mount
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl text-center my-4">Random Videos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video, index) => (
                    <div key={index} className="bg-white p-4 shadow rounded">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-48 object-cover rounded mb-4"
                        />
                        <h3 className="text-lg font-semibold">{video.title}</h3>
                        <p className="text-sm text-gray-600">
                            {video.description}
                        </p>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="text-center my-4">Loading more videos...</div>
            )}
            {!hasMore && videos.length > 0 && (
                <div className="text-center my-4">No more videos to load.</div>
            )}
        </div>
    );
}

export default Home;
