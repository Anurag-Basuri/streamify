import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const usePlaylist = (playlistId, user) => {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPlaylist = async () => {
        try {
            const { data } = await axios.get(
                `/api/v1/playlists/${playlistId}`,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            setPlaylist(data.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load playlist");
            toast.error(err.response?.data?.message || "Failed to load playlist");
        } finally {
            setLoading(false);
        }
    };

    const addVideo = async (videoId) => {
        try {
            const { data } = await axios.post(
                `/api/v1/playlists/${playlistId}/videos/${videoId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            setPlaylist(prev => ({
                ...prev,
                videos: [...prev.videos, data.data],
            }));
            toast.success("Video added to playlist");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add video");
            return false;
        }
    };

    const removeVideo = async (videoId) => {
        try {
            await axios.delete(
                `/api/v1/playlists/remove/${playlistId}/videos/${videoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            setPlaylist(prev => ({
                ...prev,
                videos: prev.videos.filter(v => v._id !== videoId),
            }));
            toast.success("Video removed from playlist");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove video");
            return false;
        }
    };

    return {
        playlist,
        loading,
        error,
        fetchPlaylist,
        addVideo,
        removeVideo,
        setPlaylist,
    };
};

export default usePlaylist;