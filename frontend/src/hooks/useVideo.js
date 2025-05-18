import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const useVideo = (user, videoID) => {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVideo = useCallback(async () => {
        if (!user || !videoID) {
            setError("User or videoID missing");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/videos/${videoID}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            // response.data.data is a single video object
            setVideo(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch video");
            toast.error("Could not load the video");
        } finally {
            setLoading(false);
        }
    }, [user, videoID]);

    // Dummy implementations for incrementViews and addToHistory
    const incrementViews = useCallback(async () => {
        if (!user || !videoID) return;
        try {
            await axios.post(
                `/api/v1/videos/${videoID}/views`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
        } catch (err) {
            // Optionally handle error
        }
    }, [user, videoID]);

    const addToHistory = useCallback(async () => {
        // Implement your add to history logic here if needed
    }, []);

    return {
        video,
        loading,
        error,
        fetchVideo,
        incrementViews,
        addToHistory,
    };
};

export default useVideo;
