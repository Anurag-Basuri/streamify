import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { FaSpinner, FaClock, FaUser } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useWatchLater from "../../hooks/useWatchLater";
import useVideo from "../../hooks/useVideo";

const VideoPlayer = () => {
    const { videoID } = useParams();
    const { user } = useAuth();
    console.log("VideoPlayer mounted. videoID:", videoID, "user:", user);

    const watchLater = useWatchLater(user);

    // Make sure you pass user first, then videoID
    const { video, loading, error, fetchVideos, incrementViews, addToHistory } =
        useVideo(user, videoID);

    console.log("useVideo hook result:", { video, loading, error });

    // Fetch video and watch later only once on mount or videoID change
    useEffect(() => {
        console.log("useEffect: Fetching video and watch later...");
        fetchVideos();
        watchLater.fetchWatchLater();
        // eslint-disable-next-line
    }, [videoID]);

    // Handle video play event
    const handlePlay = useCallback(async () => {
        try {
            console.log(
                "Video started playing. Incrementing views and adding to history..."
            );
            await incrementViews();
            await addToHistory();
        } catch (err) {
            console.error("Error tracking video play:", err);
        }
    }, [incrementViews, addToHistory]);

    // Handle Watch Later
    const handleWatchLater = useCallback(async () => {
        if (!video?._id) {
            console.warn("handleWatchLater: No video._id found!");
            return;
        }
        try {
            if (watchLater.isInWatchLater(video._id)) {
                console.log("Removing from Watch Later:", video._id);
                await watchLater.removeFromWatchLater(video._id);
            } else {
                console.log("Adding to Watch Later:", video._id);
                await watchLater.addToWatchLater(video._id);
            }
        } catch (err) {
            console.error("Error updating Watch Later:", err);
        }
    }, [video, watchLater]);

    if (loading) {
        console.log("Loading video...");
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <FaSpinner className="animate-spin text-4xl text-purple-500" />
            </div>
        );
    }

    if (error) {
        console.error("Video loading error:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-red-500 text-xl">{error}</p>
            </div>
        );
    }

    if (!video) {
        console.warn("No video found for videoID:", videoID);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-gray-400 text-xl">Video not found.</p>
            </div>
        );
    }

    const inWatchLater = watchLater.isInWatchLater(video._id);
    console.log("Rendering video:", video);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Video Player Section */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                    {video?.videoFile?.url ? (
                        <>
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
                                            controlsList: "nodownload",
                                        },
                                    },
                                }}
                            />
                            {console.log(
                                "ReactPlayer rendered with URL:",
                                video.videoFile.url
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Video not available</p>
                        </div>
                    )}
                    {user && (
                        <button
                            className={`absolute top-4 right-4 z-10 p-3 rounded-full shadow-lg transition-colors text-lg ${
                                inWatchLater
                                    ? "bg-yellow-400 text-white"
                                    : "bg-gray-900/80 text-yellow-400 hover:bg-yellow-500"
                            }`}
                            title={
                                inWatchLater
                                    ? "Remove from Watch Later"
                                    : "Add to Watch Later"
                            }
                            onClick={handleWatchLater}
                            disabled={watchLater.loading}
                        >
                            <FaClock />
                            {watchLater.loading && (
                                <span className="ml-2 animate-spin">
                                    <FaSpinner />
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* Video Metadata Section */}
                <div className="mt-8 space-y-4">
                    <h1 className="text-3xl font-bold">
                        {video?.title || "Untitled Video"}
                    </h1>
                    <p className="text-gray-400">
                        {video?.description || "No description available."}
                    </p>
                    <div className="flex items-center gap-4">
                        <img
                            src={video?.owner?.avatar || "/default-avatar.png"}
                            alt={video?.owner?.userName || "Unknown User"}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-medium">
                                {video?.owner?.userName || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-400">
                                {video?.views?.toLocaleString() || 0} views
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
