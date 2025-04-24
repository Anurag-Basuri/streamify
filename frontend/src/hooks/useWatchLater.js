import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function useWatchLater(user) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [watchLaterIds, setWatchLaterIds] = useState([]);

    // Fetch user's current Watch Later list (IDs only)
    const fetchWatchLater = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const res = await axios.get("/api/v1/watchlater", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const ids = (res.data?.data?.videos || []).map(v => v.video?._id || v.video);
            setWatchLaterIds(ids);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch Watch Later");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Add video to Watch Later
    const addToWatchLater = useCallback(async (videoId) => {
        if (!user?.token) {
            toast.error("You must be logged in to add to Watch Later.");
            return false;
        }
        try {
            setLoading(true);
            await axios.post(
                `/api/v1/watchlater/${videoId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );
            setWatchLaterIds(prev => [...prev, videoId]);
            toast.success("Added to Watch Later!");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add to Watch Later");
            setError(err.response?.data?.message || "Failed to add to Watch Later");
            return false;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Remove video from Watch Later
    const removeFromWatchLater = useCallback(async (videoId) => {
        if (!user?.token) {
            toast.error("You must be logged in to remove from Watch Later.");
            return false;
        }
        try {
            setLoading(true);
            await axios.delete(
                `/api/v1/watchlater/${videoId}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );
            setWatchLaterIds(prev => prev.filter(id => id !== videoId));
            toast.success("Removed from Watch Later");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove from Watch Later");
            setError(err.response?.data?.message || "Failed to remove from Watch Later");
            return false;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Check if a video is in Watch Later
    const isInWatchLater = useCallback((videoId) => watchLaterIds.includes(videoId), [watchLaterIds]);

    return {
        loading,
        error,
        watchLaterIds,
        fetchWatchLater,
        addToWatchLater,
        removeFromWatchLater,
        isInWatchLater,
    };
}
