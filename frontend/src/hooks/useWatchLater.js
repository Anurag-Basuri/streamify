import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

const useWatchLater = (user) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingVideo, setRemovingVideo] = useState(null);
    const [sortBy, setSortBy] = useState("recent");
    const [filter, setFilter] = useState("all");
    const [remindLater, setRemindLater] = useState({});
    const [pagination, setPagination] = useState(null);

    const clearError = () => setError("");

    const isInWatchLater = useCallback(
        (videoId) => videos.some((video) => video._id === videoId),
        [videos]
    );

    // Fetch watch later videos from backend
    const fetchWatchLater = useCallback(async () => {
        if (!user?.token) {
            setVideos([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sortBy,
                filter,
            }).toString();
            const response = await fetch(`/api/v1/watchlater?${params}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Couldn't fetch watch later");

            // Map backend response to flat array for UI
            const flat = (data.data?.videos || []).map((item) => ({
                ...item.video,
                addedAt: item.addedAt,
                remindAt: item.remindAt,
                _watchlaterId: item._id,
            }));
            setVideos(flat);
            setPagination(data.data?.pagination || null);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, sortBy, filter]);

    // Remove a video from watch later (sync with backend)
    const removeFromWatchLater = async (videoId) => {
        try {
            setRemovingVideo(videoId);
            const response = await fetch(`/api/v1/watchlater/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to remove video");
            // Use backend response to update videos
            const flat = (data.data?.videos || []).map((item) => ({
                ...item.video,
                addedAt: item.addedAt,
                remindAt: item.remindAt,
                _watchlaterId: item._id,
            }));
            setVideos(flat);
            setRemovingVideo(null);
            toast.success("Video removed from Watch Later");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
            setRemovingVideo(null);
        }
    };

    // Clear all videos from watch later
    const clearWatchLater = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/watchlater/clear`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to clear Watch Later");
            setVideos([]);
            toast.success("Watch Later cleared");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Set or remove a reminder for a video
    const setReminder = async (videoId, remindAt) => {
        try {
            const response = await fetch(
                `/api/v1/watchlater/${videoId}/reminder`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user?.token}`,
                    },
                    body: JSON.stringify({ remindAt }),
                }
            );
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to set reminder");
            setRemindLater((prev) => ({ ...prev, [videoId]: !!remindAt }));
            // Optionally update the video's remindAt in local state
            setVideos((prev) =>
                prev.map((v) =>
                    v._id === videoId
                        ? { ...v, remindAt: data.data?.video?.remindAt || null }
                        : v
                )
            );
            toast.success(
                remindAt ? "Reminder set successfully" : "Reminder removed"
            );
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    // Filtering and sorting (client-side fallback)
    const getFilteredVideos = useCallback(() => {
        let filteredVideos = videos;

        if (filter === "today") {
            filteredVideos = filteredVideos.filter((v) => {
                const d = new Date(v.addedAt);
                const now = new Date();
                return d.toDateString() === now.toDateString();
            });
        } else if (filter === "week") {
            filteredVideos = filteredVideos.filter((v) => {
                const d = new Date(v.addedAt);
                const now = new Date();
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                return d >= weekAgo;
            });
        }

        if (sortBy === "recent") {
            filteredVideos = [...filteredVideos].sort(
                (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
            );
        }

        return filteredVideos;
    }, [videos, filter, sortBy]);

    useEffect(() => {
        if (user?.token) fetchWatchLater();
    }, [user?.token, fetchWatchLater]);

    return {
        videos: getFilteredVideos(),
        loading,
        fetchWatchLater,
        error,
        clearError,
        removingVideo,
        setRemovingVideo,
        removeFromWatchLater,
        clearWatchLater,
        sortBy,
        setSortBy,
        filter,
        setFilter,
        remindLater,
        setReminder,
        isInWatchLater,
        refresh: fetchWatchLater,
        pagination,
    };
};

useWatchLater.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
    }),
};

export default useWatchLater;
