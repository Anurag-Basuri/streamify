import { useState, useEffect } from 'react';
import axios from 'axios';

const useVideo = (videoId, user) => {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchVideo = async () => {
        try {
            const response = await axios.get(`/api/v1/videos/${videoId}`);
            if (!response.data.success) {
                throw new Error("Failed to fetch video details");
            }
            setVideo(response.data.data);
            setError('');
        } catch (err) {
            setError(err.message || "Failed to load video");
        } finally {
            setLoading(false);
        }
    };

    const incrementViews = async () => {
        const viewedKey = `viewed_${videoId}`;
        if (!localStorage.getItem(viewedKey)) {
            try {
                await axios.post(`/api/v1/videos/${videoId}/views`);
                localStorage.setItem(viewedKey, true);
            } catch (err) {
                console.error("Error updating view count:", err);
            }
        }
    };

    const addToHistory = async () => {
        if (!user) return;
        try {
            await axios.post(`/api/v1/history/add/${videoId}`, null, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
        } catch (err) {
            console.error("Error updating history:", err);
        }
    };

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