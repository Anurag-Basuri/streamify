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
    const watchLater = useWatchLater(user);

    const { video, loading, error, fetchVideo, incrementViews, addToHistory } =
        useVideo(user, videoID);

    // Fetch video and watch later only once on mount or videoID change
    useEffect(() => {
        fetchVideo();
        watchLater.fetchWatchLater();
        // eslint-disable-next-line
    }, [videoID]);

    // Handle video play event
    const handlePlay = useCallback(async () => {
        try {
            await incrementViews();
            await addToHistory();
        } catch (err) {
            // Optionally handle error
        }
    }, [incrementViews, addToHistory]);

    // Handle Watch Later
    const handleWatchLater = useCallback(async () => {
        if (!video?._id) return;
        try {
            if (watchLater.isInWatchLater(video._id)) {
                await watchLater.removeFromWatchLater(video._id);
            } else {
                await watchLater.addToWatchLater(video._id);
            }
        } catch (err) {
            // Optionally handle error
        }
    }, [video, watchLater]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <FaSpinner className="animate-spin text-5xl text-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-red-500 text-2xl mb-4">Error</p>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-400 text-2xl">Video not found.</p>
                </div>
            </div>
        );
    }

    const inWatchLater = watchLater.isInWatchLater(video._id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-0 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Video Player Section */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
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
                            {/* Watch Later Button */}
                            {user && (
                                <button
                                    className={`absolute top-4 right-4 z-10 p-3 rounded-full shadow-lg transition-colors text-lg flex items-center gap-2
                                        ${
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
                                    <span className="hidden md:inline text-sm font-semibold">
                                        {inWatchLater ? "Saved" : "Watch Later"}
                                    </span>
                                    {watchLater.loading && (
                                        <FaSpinner className="ml-2 animate-spin" />
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Video not available</p>
                        </div>
                    )}
                </div>

                {/* Video Metadata Section */}
                <div className="mt-8 space-y-6 px-2 md:px-0">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {video?.title || "Untitled Video"}
                    </h1>
                    <p className="text-gray-300 text-lg mb-4">
                        {video?.description || "No description available."}
                    </p>
                    <div className="flex items-center gap-4">
                        <img
                            src={video?.owner?.avatar || "/default-avatar.png"}
                            alt={video?.owner?.userName || "Unknown User"}
                            className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
                        />
                        <div>
                            <p className="font-medium text-lg">
                                {video?.owner?.userName || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-400">
                                {video?.views?.toLocaleString() || 0} views
                            </p>
                        </div>
                    </div>
                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {video.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs font-medium bg-purple-700/30 text-purple-200 rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
