import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const useVideo = (user) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    const fetchVideos = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/v1/videos/user/${user._id}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: { search: searchQuery, sort: sortBy },
                }
            );
            setVideos(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch videos");
            toast.error("Could not load your videos");
        } finally {
            setLoading(false);
        }
    }, [user, searchQuery, sortBy]);

    const deleteVideo = async (videoId) => {
        try {
            await axios.delete(`/api/v1/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            toast.success("Video deleted successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete video"
            );
        }
    };

    const togglePublish = async (videoId) => {
        try {
            const video = videos.find((v) => v._id === videoId);
            const response = await axios.patch(
                `/api/v1/videos/${videoId}/publish`,
                { isPublished: !video.isPublished },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setVideos((prev) =>
                prev.map((v) => (v._id === videoId ? response.data.data : v))
            );
            toast.success(
                `Video ${
                    video.isPublished ? "unpublished" : "published"
                } successfully`
            );
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update video status"
            );
        }
    };

    return {
        videos,
        loading,
        error,
        fetchVideos,
        deleteVideo,
        togglePublish,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
    };
};

export default useVideo;
