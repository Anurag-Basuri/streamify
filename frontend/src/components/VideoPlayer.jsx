import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";
import { FaSpinner } from "react-icons/fa";

const VideoPlayer = () => {
    const { videoID } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/v1/videos/${videoID}`
                );
                if (!response.data.success) {
                    throw new Error("Failed to fetch video details");
                }
                setVideo(response.data.data); // Set the nested `data` object
            } catch (err) {
                setError(err.message || "Failed to load video");
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [videoID]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <FaSpinner className="animate-spin text-4xl text-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-red-500 text-xl">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <ReactPlayer
                        url={video.videoFile.url}
                        controls
                        width="100%"
                        height="100%"
                        playing
                        config={{
                            file: {
                                attributes: {
                                    controlsList: "nodownload", // Disable download option
                                },
                            },
                        }}
                    />
                </div>

                <div className="mt-8 space-y-4">
                    <h1 className="text-3xl font-bold">{video.title}</h1>
                    <p className="text-gray-400">{video.description}</p>
                    <div className="flex items-center gap-4">
                        <img
                            src={video.owner.avatar || "/default-avatar.png"}
                            alt={video.owner.userName}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-medium">{video.owner.userName}</p>
                            <p className="text-sm text-gray-400">
                                {video.views.toLocaleString()} views
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;