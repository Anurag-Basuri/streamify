import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import { ClockIcon, TrashIcon, PlayIcon } from "@heroicons/react/24/outline";
import { PlayCircleIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/solid";
import emptyStateIllustration from "../../assets/watch-later-empty.svg";

const Watchlater = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);
    const [removingVideo, setRemovingVideo] = useState(null);

    useEffect(() => {
        const fetchWatchLater = async () => {
            try {
                const response = await fetch("/api/v1/watchlater", {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Couldn't fetch watch later");
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
            setRemovingVideo(null);
        } catch (err) {
            setError(err.message);
            setRemovingVideo(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-full w-48 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-lg">
                                <div className="aspect-video bg-gray-200 rounded-t-xl"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center bg-red-50 p-8 rounded-2xl shadow-lg">
                    <DocumentMagnifyingGlassIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                        <ClockIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Watch Later
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {videos.length} saved videos
                        </p>
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                        <img
                            src={emptyStateIllustration}
                            alt="Empty watch later"
                            className="w-64 mx-auto mb-8"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Your Time Capsule Awaits
                        </h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Save videos you want to watch later and they&apos;ll
                            appear here. Curate your perfect viewing experience!
                        </p>
                        <Link
                            to="/videos"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl 
                            hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg"
                        >
                            <PlayCircleIcon className="w-5 h-5" />
                            Explore Trending Videos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video._id}
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
                                                setRemovingVideo(video._id)
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

                                {removingVideo === video._id && (
                                    <div
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
                                                        setRemovingVideo(null)
                                                    }
                                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 
                                                    transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRemove(video._id)
                                                    }
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg 
                                                    hover:bg-red-700 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlater;