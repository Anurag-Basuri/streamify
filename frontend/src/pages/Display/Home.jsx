import { useState, useEffect } from "react";
import axios from "axios";

function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideos = async (pageNumber = 1) => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const res = await axios.get(
                `http://your-backend-url/api/videos?page=${pageNumber}`
            );
            console.log("API Response:", res);

            if (res.status !== 200 || !res.data) {
                throw new Error("Invalid API response");
            }

            const newVideos = res.data.data || []; // Assuming API returns { data: [...] }

            setVideos((prevVideos) => [...prevVideos, ...newVideos]);
            setHasMore(newVideos.length > 0);
            setPage(pageNumber + 1);
        } catch (error) {
            console.error("Error fetching videos:", error.message);
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
            fetchVideos(page);
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
