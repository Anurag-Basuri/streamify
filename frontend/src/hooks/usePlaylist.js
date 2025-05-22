import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

/**
 * Custom hook for managing playlists across the application
 * @param {string} initialPlaylistId - Optional playlist ID to load initially
 * @returns {Object} Playlist management methods and state
 */
const usePlaylist = (initialPlaylistId = null) => {
    const { user, isAuthenticated } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to get a valid token
    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    }, []);

    // Fetch all user playlists
    const fetchUserPlaylists = useCallback(async () => {
        if (!isAuthenticated) {
            setPlaylists([]);
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            const headers = getAuthHeader();
            if (!headers) throw new Error("No authentication token available");

            const { data } = await axios.get("/api/v1/playlists/user", {
                headers,
            });

            const fetchedPlaylists = data?.data || [];
            setPlaylists(fetchedPlaylists);
            return fetchedPlaylists;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to fetch playlists";
            setError(errorMessage);
            console.error("Playlist fetch error:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeader]);

    // Fetch a specific playlist by ID
    const fetchPlaylist = useCallback(
        async (playlistId = initialPlaylistId) => {
            if (!playlistId || !isAuthenticated) {
                setCurrentPlaylist(null);
                return null;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeader();
                if (!headers)
                    throw new Error("No authentication token available");

                const { data } = await axios.get(
                    `/api/v1/playlists/${playlistId}`,
                    {
                        headers,
                    }
                );

                const fetchedPlaylist = data?.data || null;
                setCurrentPlaylist(fetchedPlaylist);
                return fetchedPlaylist;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to fetch playlist";
                setError(errorMessage);
                console.error("Playlist fetch error:", err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [initialPlaylistId, isAuthenticated, getAuthHeader]
    );

    // Create a new playlist
    const createPlaylist = useCallback(
        async (playlistData) => {
            if (!isAuthenticated) {
                toast.error("You must be logged in to create playlists");
                return null;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeader();
                if (!headers)
                    throw new Error("No authentication token available");

                const { data } = await axios.post(
                    "/api/v1/playlists",
                    playlistData,
                    {
                        headers,
                    }
                );

                const newPlaylist = data?.data || null;

                // Update playlists list
                setPlaylists((prev) => [...prev, newPlaylist]);
                toast.success("Playlist created successfully");

                return newPlaylist;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to create playlist";
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Playlist creation error:", err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, getAuthHeader]
    );

    // Update a playlist
    const updatePlaylist = useCallback(
        async (playlistId, updateData) => {
            if (!isAuthenticated || !playlistId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeader();
                if (!headers)
                    throw new Error("No authentication token available");

                const { data } = await axios.patch(
                    `/api/v1/playlists/${playlistId}`,
                    updateData,
                    {
                        headers,
                    }
                );

                const updatedPlaylist = data?.data || null;

                // Update state if this is the current playlist
                if (currentPlaylist && currentPlaylist._id === playlistId) {
                    setCurrentPlaylist(updatedPlaylist);
                }

                // Update playlists list
                setPlaylists((prev) =>
                    prev.map((p) =>
                        p._id === playlistId ? updatedPlaylist : p
                    )
                );

                toast.success("Playlist updated successfully");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to update playlist";
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Playlist update error:", err);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, currentPlaylist, getAuthHeader]
    );

    // Delete a playlist
    const deletePlaylist = useCallback(
        async (playlistId) => {
            if (!isAuthenticated || !playlistId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeader();
                if (!headers)
                    throw new Error("No authentication token available");

                await axios.delete(`/api/v1/playlists/${playlistId}`, {
                    headers,
                });

                // Update playlists list
                setPlaylists((prev) =>
                    prev.filter((p) => p._id !== playlistId)
                );

                // Clear current playlist if it was deleted
                if (currentPlaylist && currentPlaylist._id === playlistId) {
                    setCurrentPlaylist(null);
                }

                toast.success("Playlist deleted successfully");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to delete playlist";
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Playlist deletion error:", err);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, currentPlaylist, getAuthHeader]
    );

    // Add video to playlist
    const addVideoToPlaylist = useCallback(
        async (playlistId, videoId) => {
            if (!isAuthenticated || !playlistId || !videoId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeader();
                if (!headers)
                    throw new Error("No authentication token available");

                const { data } = await axios.post(
                    `/api/v1/playlists/${playlistId}/videos/${videoId}`,
                    {},
                    {
                        headers,
                    }
                );

                const updatedPlaylist = data?.data || null;

                // Update state if this is the current playlist
                if (currentPlaylist && currentPlaylist._id === playlistId) {
                    setCurrentPlaylist(updatedPlaylist);
                }

                // Update playlists list
                setPlaylists((prev) =>
                    prev.map((p) =>
                        p._id === playlistId ? updatedPlaylist : p
                    )
                );

                toast.success("Video added to playlist");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Failed to add video to playlist";
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Add video to playlist error:", err);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, currentPlaylist, getAuthHeader]
    );

    // Remove video from playlist
    const removeVideoFromPlaylist = useCallback(
        async (playlistId, videoId) => {
            if (!isAuthenticated || !playlistId || !videoId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeader();
                if (!headers)
                    throw new Error("No authentication token available");

                const { data } = await axios.delete(
                    `/api/v1/playlists/${playlistId}/videos/${videoId}`,
                    {
                        headers,
                    }
                );

                const updatedPlaylist = data?.data || null;

                // Update state if this is the current playlist
                if (currentPlaylist && currentPlaylist._id === playlistId) {
                    setCurrentPlaylist(updatedPlaylist);
                }

                // Update playlists list
                setPlaylists((prev) =>
                    prev.map((p) =>
                        p._id === playlistId ? updatedPlaylist : p
                    )
                );

                toast.success("Video removed from playlist");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Failed to remove video from playlist";
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Remove video from playlist error:", err);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, currentPlaylist, getAuthHeader]
    );

    // Check if a video is in a playlist
    const isVideoInPlaylist = useCallback(
        (playlistId, videoId) => {
            if (!playlistId || !videoId) return false;

            // Check in current playlist first for efficiency
            if (currentPlaylist && currentPlaylist._id === playlistId) {
                return currentPlaylist.videos.some(
                    (video) => video._id === videoId
                );
            }

            // Otherwise check in playlists array
            const playlist = playlists.find((p) => p._id === playlistId);
            if (!playlist) return false;

            return playlist.videos.some((video) => video._id === videoId);
        },
        [currentPlaylist, playlists]
    );

    // Load initial playlist if ID was provided
    useEffect(() => {
        if (initialPlaylistId) {
            fetchPlaylist(initialPlaylistId);
        }
    }, [initialPlaylistId, fetchPlaylist]);

    // Load user playlists when auth state changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserPlaylists();
        } else {
            setPlaylists([]);
            setCurrentPlaylist(null);
        }
    }, [isAuthenticated, fetchUserPlaylists]);

    return {
        // State
        playlists,
        currentPlaylist,
        loading,
        error,

        // Methods
        fetchUserPlaylists,
        fetchPlaylist,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        isVideoInPlaylist,

        // Setters
        setCurrentPlaylist,
    };
};

export default usePlaylist;
