import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/AuthContext.jsx";
import { Link } from "react-router-dom";
import {
    FilmIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon,
    ChartBarIcon,
    PlusCircleIcon,
    EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

const YourVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext); // Fixed the useAuth hook

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(
                    `/api/v1/videos?userId=${user?._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    }
                );
                const data = await response.json();
                if (!response.ok)
                    throw new Error(data.message || "Failed to fetch videos");
                setVideos(data.data?.videos || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchVideos();
    }, [user]);

    const handleDelete = async (videoId) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                const response = await fetch(`/api/v1/videos/${videoId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                if (!response.ok) throw new Error("Failed to delete video");
                setVideos((prev) =>
                    prev.filter((video) => video._id !== videoId)
                );
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleTogglePublish = async (videoId) => {
        try {
            const response = await fetch(
                `/api/v1/videos/${videoId}/toggle-publish`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to update status");

            setVideos((prev) =>
                prev.map((video) =>
                    video._id === videoId
                        ? { ...video, isPublished: !video.isPublished }
                        : video
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <FilmIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Your Videos
                        </h1>
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {videos.length} video{videos.length !== 1 && "s"}
                        </span>
                    </div>
                    <Link
                        to="/upload"
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Upload New Video
                    </Link>
                </div>

                {/* Empty State */}
                {videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">
                            You haven't uploaded any videos yet
                        </p>
                        <Link
                            to="/upload"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Upload Your First Video
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video._id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Thumbnail Section */}
                                <div className="relative aspect-video rounded-t-xl overflow-hidden">
                                    <img
                                        src={video.thumbnail?.url}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                                        {Math.floor(video.duration / 60)}:
                                        {(video.duration % 60)
                                            .toString()
                                            .padStart(2, "0")}
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <span
                                            className={`px-2 py-1 rounded text-sm ${
                                                video.isPublished
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {video.isPublished
                                                ? "Published"
                                                : "Draft"}
                                        </span>
                                    </div>
                                </div>

                                {/* Video Details */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <Link
                                            to={`/video/${video._id}`}
                                            className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 flex-1"
                                        >
                                            {video.title}
                                        </Link>
                                        {/* Dropdown Menu */}
                                        <div className="dropdown dropdown-end">
                                            <button className="p-1 hover:bg-gray-100 rounded-lg">
                                                <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                                            </button>
                                            <ul className="dropdown-content menu shadow bg-white rounded-box w-48 z-10">
                                                <li>
                                                    <Link
                                                        to={`/edit-video/${video._id}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Edit Details
                                                    </Link>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() =>
                                                            handleTogglePublish(
                                                                video._id
                                                            )
                                                        }
                                                        className="flex items-center gap-2"
                                                    >
                                                        {video.isPublished ? (
                                                            <>
                                                                <EyeIcon className="w-4 h-4" />
                                                                Unpublish
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeIcon className="w-4 h-4" />
                                                                Publish
                                                            </>
                                                        )}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                video._id
                                                            )
                                                        }
                                                        className="text-red-600 flex items-center gap-2"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Video Stats */}
                                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <ChartBarIcon className="w-4 h-4" />
                                            {video.views?.toLocaleString()}{" "}
                                            views
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ClockIcon className="w-4 h-4" />
                                            {new Date(
                                                video.createdAt
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {video.tags?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {video.tags
                                                .slice(0, 3)
                                                .map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourVideos;
