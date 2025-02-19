import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { ClockIcon, TrashIcon, PlayIcon } from "@heroicons/react/24/outline";
import { PlayCircleIcon } from "@heroicons/react/24/solid";

const Watchlater = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchWatchLater = async () => {
            try {
                const response = await fetch("/api/v1/watchlater", {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok)
                    throw new Error(
                        data.message || "Couldn't fetch watch later"
                    );
                setVideos(data.data?.videos || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchWatchLater();
    }, [user]);

    const handleRemove = async (videoId) => {
        try {
            const response = await fetch(`/api/v1/watchlater/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to remove video");
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <ClockIcon className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Watch Later
                    </h1>
                </div>

                {videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">
                            Your watch later list is empty
                        </p>
                        <Link
                            to="/videos"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlayCircleIcon className="w-5 h-5" />
                            Browse Videos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video._id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="relative aspect-video rounded-t-xl overflow-hidden">
                                    <img
                                        src={video.thumbnail?.url}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <PlayIcon className="w-12 h-12 text-white" />
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <Link
                                            to={`/video/${video._id}`}
                                            className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                                        >
                                            {video.title}
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleRemove(video._id)
                                            }
                                            className="text-red-500 hover:text-red-700 p-1 -mt-1 -mr-1"
                                            aria-label="Remove from watch later"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <Link
                                            to={`/channel/${video.owner?._id}`}
                                            className="flex items-center gap-2 group"
                                        >
                                            <img
                                                src={video.owner?.avatar}
                                                alt={video.owner?.userName}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-blue-600">
                                                {video.owner?.userName}
                                            </span>
                                        </Link>
                                    </div>

                                    <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                                        {video.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlater;
