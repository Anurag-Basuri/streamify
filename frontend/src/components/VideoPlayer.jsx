import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";
import { FaSpinner } from "react-icons/fa";
import { AuthContext } from "../services/AuthContext.jsx";

const VideoPlayer = () => {
    const { user } = useContext(AuthContext);
    const [videoID, setVideoID] = useState(useParams().videoID);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Get video ID from URL parameters
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/v1/videos/${videoID}`
                );
                if (!response.data.success) {
                    throw new Error("Failed to fetch video details");
                }
                setVideo(response.data.data);
                setVideoID(response.data.data._id);
            } catch (err) {
                setError(err.message || "Failed to load video");
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [videoID]);

    // Handle video play event to increment view count and add to history
    const handlePlay = async () => {
        const viewedKey = `viewed_${videoID}`;
        if (!localStorage.getItem(viewedKey)) {
            try {
                // Increment view count
                await fetch(
                    `api/v1/videos/${videoID}/views`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                localStorage.setItem(viewedKey, true);
            } catch (err) {
                console.error("Error updating video stats:", err);
            }
        }

        // Add to history if user is logged in
        await axios.post(`/api/v1/history/add/${videoID}`, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });
        
    };

    // Handle video ID from URL parameters
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <FaSpinner className="animate-spin text-4xl text-purple-500" />
            </div>
        );
    }

    //check if video is not found
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
                    {video?.videoFile?.url && (
                        <ReactPlayer
                            onPlay={handlePlay}
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
                    )}
                </div>

                <div className="mt-8 space-y-4">
                    <h1 className="text-3xl font-bold">{video?.title}</h1>
                    <p className="text-gray-400">{video?.description}</p>
                    <div className="flex items-center gap-4">
                        <img
                            src={video?.owner?.avatar || "/default-avatar.png"}
                            alt={video?.owner?.userName}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-medium">
                                {video?.owner?.userName}
                            </p>
                            <p className="text-sm text-gray-400">
                                {video?.views?.toLocaleString()} views
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
