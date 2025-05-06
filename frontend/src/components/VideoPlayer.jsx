import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { FaSpinner, FaClock } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import useWatchLater from "../hooks/useWatchLater";
import useVideo from "../hooks/useVideo";

const VideoPlayer = () => {
    const { videoID } = useParams();
    const { user } = useAuth();
    const watchLater = useWatchLater(user);
    const { video, loading, error, fetchVideos, incrementViews, addToHistory } =
        useVideo(videoID, user);

    // Initial fetch
    useEffect(() => {
        fetchVideos();
        watchLater.fetchWatchLater();
    }, [videoID, fetchVideos, watchLater]);

    // Handle video play event
    const handlePlay = async () => {
        await incrementViews();
        await addToHistory();
    };

    // Handle Watch Later
    const handleWatchLater = async () => {
        if (!video?._id) return;

        if (watchLater.isInWatchLater(video._id)) {
            await watchLater.removeFromWatchLater(video._id);
        } else {
            await watchLater.addToWatchLater(video._id);
        }
    };

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
                                        controlsList: "nodownload",
                                    },
                                },
                            }}
                        />
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
