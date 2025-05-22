import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Custom hook for managing playlists across the application
 * @param {string} initialPlaylistId - Optional playlist ID to load initially
 * @param {Object} user - User object from auth context
 * @returns {Object} Playlist management methods and state
 */
const usePlaylist = (initialPlaylistId = null, user = null) => {
    const [playlists, setPlaylists] = useState([]);
    const [playlist, setPlaylist] = useState(null); // Changed from currentPlaylist to match your components
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if user is authenticated
    const isAuthenticated = Boolean(user);

    // Helper function to get auth headers
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    }, []);

    // Fetch all user playlists - matches your backend route
    const fetchUserPlaylists = useCallback(async () => {
        if (!isAuthenticated) {
            setPlaylists([]);
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            const headers = getAuthHeaders();
            if (!headers) {
                throw new Error("Authentication required");
            }

            // Using your backend route: GET /api/v1/playlists/
            const { data } = await axios.get("/api/v1/playlists/", {
                headers,
            });

            const fetchedPlaylists = data?.data?.playlists || data?.data || [];
            setPlaylists(fetchedPlaylists);
            return fetchedPlaylists;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to fetch playlists";
            setError(errorMessage);
            console.error("Playlist fetch error:", err);
            toast.error(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // Fetch a specific playlist by ID - matches your backend route
    const fetchPlaylist = useCallback(
        async (playlistId = initialPlaylistId) => {
            if (!playlistId || !isAuthenticated) {
                setPlaylist(null);
                return null;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();
                if (!headers) {
                    throw new Error("Authentication required");
                }

                // Using your backend route: GET /api/v1/playlists/:playlistId
                const { data } = await axios.get(
                    `/api/v1/playlists/${playlistId}`,
                    {
                        headers,
                    }
                );

                const fetchedPlaylist = data?.data || null;
                setPlaylist(fetchedPlaylist);
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
        [initialPlaylistId, isAuthenticated, getAuthHeaders]
    );

    // Create a new playlist - matches your backend route
    const createPlaylist = useCallback(
        async (playlistData, videoId = null) => {
            if (!isAuthenticated) {
                toast.error("You must be logged in to create playlists");
                return null;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();
                if (!headers) {
                    throw new Error("Authentication required");
                }

                // Using your backend route: POST /api/v1/playlists/create/:videoId?
                const url = videoId
                    ? `/api/v1/playlists/create/${videoId}`
                    : "/api/v1/playlists/create";

                const { data } = await axios.post(url, playlistData, {
                    headers,
                });

                const newPlaylist = data?.data || null;
                if (newPlaylist) {
                    setPlaylists((prev) => [newPlaylist, ...prev]);
                    toast.success("Playlist created successfully");
                }

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
        [isAuthenticated, getAuthHeaders]
    );

    // Update a playlist - matches your backend route
    const updatePlaylist = useCallback(
        async (playlistId, updateData) => {
            if (!isAuthenticated || !playlistId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();
                if (!headers) {
                    throw new Error("Authentication required");
                }

                // Using your backend route: PUT /api/v1/playlists/update/:playlistId
                const { data } = await axios.put(
                    `/api/v1/playlists/update/${playlistId}`,
                    updateData,
                    { headers }
                );

                const updatedPlaylist = data?.data || null;

                // Update current playlist if it matches
                if (playlist && playlist._id === playlistId) {
                    setPlaylist(updatedPlaylist);
                }

                // Update playlists array
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
        [isAuthenticated, playlist, getAuthHeaders]
    );

    // Delete a playlist - matches your backend route
    const deletePlaylist = useCallback(
        async (playlistId) => {
            if (!isAuthenticated || !playlistId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();
                if (!headers) {
                    throw new Error("Authentication required");
                }

                // Using your backend route: DELETE /api/v1/playlists/delete/:playlistId
                await axios.delete(`/api/v1/playlists/delete/${playlistId}`, {
                    headers,
                });

                // Update playlists array
                setPlaylists((prev) =>
                    prev.filter((p) => p._id !== playlistId)
                );

                // Clear current playlist if it was deleted
                if (playlist && playlist._id === playlistId) {
                    setPlaylist(null);
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
        [isAuthenticated, playlist, getAuthHeaders]
    );

    // Add video to playlist - matches your backend route
    const addVideo = useCallback(
        async (videoId, playlistId = playlist?._id) => {
            if (!isAuthenticated || !playlistId || !videoId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();
                if (!headers) {
                    throw new Error("Authentication required");
                }

                // Using your backend route: POST /api/v1/playlists/:playlistId/videos/:videoId
                const { data } = await axios.post(
                    `/api/v1/playlists/${playlistId}/videos/${videoId}`,
                    {},
                    { headers }
                );

                const updatedPlaylist = data?.data || null;

                // Update current playlist if it matches
                if (playlist && playlist._id === playlistId) {
                    setPlaylist(updatedPlaylist);
                }

                // Update playlists array
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
        [isAuthenticated, playlist, getAuthHeaders]
    );

    // Remove video from playlist - matches your backend route
    const removeVideo = useCallback(
        async (videoId, playlistId = playlist?._id) => {
            if (!isAuthenticated || !playlistId || !videoId) {
                return false;
            }

            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();
                if (!headers) {
                    throw new Error("Authentication required");
                }

                // Using your backend route: DELETE /api/v1/playlists/remove/:playlistId/videos/:videoId
                const { data } = await axios.delete(
                    `/api/v1/playlists/remove/${playlistId}/videos/${videoId}`,
                    { headers }
                );

                const updatedPlaylist = data?.data || null;

                // Update current playlist if it matches
                if (playlist && playlist._id === playlistId) {
                    setPlaylist(updatedPlaylist);
                }

                // Update playlists array
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
        [isAuthenticated, playlist, getAuthHeaders]
    );

    // Check if a video is in a playlist
    const isVideoInPlaylist = useCallback(
        (videoId, playlistId = playlist?._id) => {
            if (!playlistId || !videoId) return false;

            // Check in current playlist first
            if (playlist && playlist._id === playlistId) {
                return playlist.videos?.some((video) => {
                    // Handle both populated and non-populated video objects
                    const id = typeof video === "string" ? video : video._id;
                    return id === videoId;
                });
            }

            // Check in playlists array
            const targetPlaylist = playlists.find((p) => p._id === playlistId);
            if (!targetPlaylist) return false;

            return targetPlaylist.videos?.some((video) => {
                const id = typeof video === "string" ? video : video._id;
                return id === videoId;
            });
        },
        [playlist, playlists]
    );

    // Load initial playlist if ID was provided
    useEffect(() => {
        if (initialPlaylistId && isAuthenticated) {
            fetchPlaylist(initialPlaylistId);
        }
    }, [initialPlaylistId, isAuthenticated, fetchPlaylist]);

    return {
        // State - using names that match your existing components
        playlists,
        playlist, // Main playlist object
        loading,
        error,

        // Methods - using names that match your existing components
        fetchUserPlaylists,
        fetchPlaylist,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addVideo, // Simplified name used in PlaylistDetail
        removeVideo, // Simplified name used in PlaylistDetail
        isVideoInPlaylist,

        // Additional methods for flexibility
        addVideoToPlaylist: addVideo, // Alias for consistency
        removeVideoFromPlaylist: removeVideo, // Alias for consistency

        // Setters for manual state management if needed
        setPlaylist,
        setPlaylists,
    };
};

export default usePlaylist;