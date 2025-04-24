import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";
import { FaSpinner, FaClock } from "react-icons/fa";
import { AuthContext } from "../services/AuthContext.jsx";
import useWatchLater from "../hooks/useWatchLater";

const VideoPlayer = () => {
    const { user } = useContext(AuthContext);
    const [videoID, setVideoID] = useState(useParams().videoID);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const watchLater = useWatchLater(user);

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
        watchLater.fetchWatchLater();
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

    // Handle Watch Later button click
    const handleWatchLater = async () => {
        if (!video?._id) return;
        if (watchLater.isInWatchLater(video._id)) {
            await watchLater.removeFromWatchLater(video._id);
        } else {
            await watchLater.addToWatchLater(video._id);
        }
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

    const inWatchLater = watchLater.isInWatchLater(video._id);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
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
                    {/* Watch Later Button Overlay */}
                    <button
                        className={`absolute top-4 right-4 z-10 p-3 rounded-full shadow-lg transition-colors text-lg ${inWatchLater ? 'bg-yellow-400 text-white' : 'bg-gray-900/80 text-yellow-400 hover:bg-yellow-500'}`}
                        title={inWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
                        onClick={handleWatchLater}
                        disabled={watchLater.loading}
                    >
                        <FaClock />
                        {watchLater.loading && (
                            <span className="ml-2 animate-spin"><FaSpinner /></span>
                        )}
                    </button>
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
