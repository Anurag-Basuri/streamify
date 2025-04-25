import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const useUserData = (isAuthenticated, apiConfig, watchLater) => {
    const [history, setHistory] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const fetchUserData = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const [historyRes, playlistsRes] = await Promise.all([
                axios.get('/api/v1/users/history', apiConfig),
                axios.get('/api/v1/playlists', apiConfig)
            ]);

            setHistory(historyRes.data.data.history);
            setPlaylists(playlistsRes.data.data.playlists);
            watchLater.fetchWatchLater();
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Error fetching user data:', error);
                toast.error(error.response?.data?.message || 'Failed to load user data');
            }
        }
    }, [apiConfig, isAuthenticated, watchLater]);

    return {
        history,
        setHistory,
        playlists,
        setPlaylists,
        fetchUserData
    };
};

export default useUserData;