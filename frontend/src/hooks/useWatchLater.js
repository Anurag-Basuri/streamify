import { useState, useEffect } from "react";
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

    const fetchWatchLater = async () => {
        try {
            const response = await fetch("/api/v1/watchlater", {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Couldn't fetch watch later");

            const flat = (data.data?.videos || []).map((item) => ({
                ...item.video,
                addedAt: item.addedAt,
                remindAt: item.remindAt,
                _watchlaterId: item._id,
            }));
            setVideos(flat);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchLater = async (videoId) => {
        try {
            const response = await fetch(`/api/v1/watchlater/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to remove video");
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
            setRemovingVideo(null);
            toast.success("Video removed from Watch Later");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
            setRemovingVideo(null);
        }
    };

    const setReminder = async (videoId) => {
        setRemindLater((prev) => ({ ...prev, [videoId]: true }));
        toast.success("Reminder set successfully");
    };

    const getFilteredVideos = () => {
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
    };

    useEffect(() => {
        if (user) fetchWatchLater();
    }, [user]);

    return {
        videos: getFilteredVideos(),
        loading,
        error,
        removingVideo,
        setRemovingVideo,
        removeFromWatchLater,
        sortBy,
        setSortBy,
        filter,
        setFilter,
        remindLater,
        setReminder,
    };
};

useWatchLater.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
    }),
};

export default useWatchLater;
