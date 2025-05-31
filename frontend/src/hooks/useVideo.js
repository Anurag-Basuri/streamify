import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const useVideo = (user) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    // Fetch all videos for the current user
    const fetchVideos = useCallback(async () => {
        if (!user) {
            setVideos([]);
            setLoading(false);
            setError("User not authenticated");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            if (sortBy) {
                if (sortBy === "recent") params.append("sort", "newest");
                else if (sortBy === "oldest") params.append("sort", "oldest");
                else if (sortBy === "popular") params.append("sort", "views");
            }
            const response = await axios.get(
                `/api/v1/videos/user?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );
            setVideos(response.data.data.videos || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch videos");
            toast.error("Could not load your videos");
        } finally {
            setLoading(false);
        }
    }, [user, searchQuery, sortBy]);

    // Delete a video
    const deleteVideo = useCallback(
        async (videoId) => {
            if (!user) return;
            try {
                await axios.delete(`/api/v1/videos/${videoId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setVideos((prev) => prev.filter((v) => v._id !== videoId));
                toast.success("Video deleted");
            } catch (err) {
                toast.error(
                    err.response?.data?.message || "Failed to delete video"
                );
            }
        },
        [user]
    );

    // Toggle publish status
    const togglePublish = useCallback(
        async (videoId) => {
            if (!user) return;
            try {
                const response = await axios.patch(
                    `/api/v1/videos/${videoId}/toggle-publish`,
                    {},
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setVideos((prev) =>
                    prev.map((v) =>
                        v._id === videoId
                            ? {
                                  ...v,
                                  isPublished: response.data.data.isPublished,
                              }
                            : v
                    )
                );
                toast.success(
                    response.data.data.isPublished
                        ? "Video published"
                        : "Video unpublished"
                );
            } catch (err) {
                toast.error(
                    err.response?.data?.message ||
                        "Failed to update publish status"
                );
            }
        },
        [user]
    );

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
