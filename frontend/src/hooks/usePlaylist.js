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
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    console.log("user: ", user)
    // Check if user is authenticated
    const isAuthenticated = Boolean(user);
    console.log("Is user authenticated?", isAuthenticated);

    // Helper function to get auth headers with validation
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error(
                "No authentication token found. Please log in again."
            );
        }
        return { Authorization: `Bearer ${token}` };
    }, []);

    // Enhanced error handler
    const handleError = useCallback(
        (error, operation = "operation", showToast = true) => {
            console.error(`${operation} error:`, error);

            let errorMessage;

            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const serverMessage = error.response.data?.message;

                switch (status) {
                    case 400:
                        errorMessage =
                            serverMessage ||
                            "Invalid request. Please check your input.";
                        break;
                    case 401:
                        errorMessage =
                            "Authentication failed. Please log in again.";
                        // Clear invalid token
                        localStorage.removeItem("accessToken");
                        break;
                    case 403:
                        errorMessage =
                            "You don't have permission to perform this action.";
                        break;
                    case 404:
                        errorMessage =
                            serverMessage ||
                            "The requested resource was not found.";
                        break;
                    case 409:
                        errorMessage =
                            serverMessage ||
                            "This action conflicts with existing data.";
                        break;
                    case 422:
                        errorMessage =
                            serverMessage || "Invalid data provided.";
                        break;
                    case 429:
                        errorMessage =
                            "Too many requests. Please try again later.";
                        break;
                    case 500:
                        errorMessage = "Server error. Please try again later.";
                        break;
                    default:
                        errorMessage =
                            serverMessage ||
                            `Request failed with status ${status}`;
                }
            } else if (error.request) {
                // Network error
                errorMessage =
                    "Network error. Please check your connection and try again.";
            } else if (error.message) {
                // Other errors
                errorMessage = error.message;
            } else {
                errorMessage = `Failed to ${operation}`;
            }

            setError(errorMessage);

            if (showToast) {
                toast.error(errorMessage);
            }

            return errorMessage;
        },
        []
    );

    // Clear error state
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch all user playlists with comprehensive error handling
    const fetchUserPlaylists = useCallback(async () => {
        console.log("Fetching user playlists...");
        console.log("Is user authenticated?", isAuthenticated);
        if (!isAuthenticated) {
            setPlaylists([]);
            clearError();
            return [];
        }

        try {
            setLoading(true);
            clearError();

            const headers = getAuthHeaders();
            console.log("Fetching user playlists with headers:", headers);
            const { data } = await axios.get("/api/v1/playlists/", { headers });
            console.log("Fetched user playlists:", data.data.playlists);

            const fetchedPlaylists = data?.data?.playlists || data?.data || [];
            setPlaylists(fetchedPlaylists);
            return fetchedPlaylists;
        } catch (err) {
            handleError(err, "fetch playlists");
            setPlaylists([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleError, clearError]);

    // Fetch a specific playlist with retry logic
    const fetchPlaylist = useCallback(
        async (playlistId = initialPlaylistId, retryCount = 0) => {
            if (!playlistId || !isAuthenticated) {
                setPlaylist(null);
                clearError();
                return null;
            }

            try {
                setLoading(true);
                clearError();

                const headers = getAuthHeaders();
                const { data } = await axios.get(
                    `/api/v1/playlists/${playlistId}`,
                    { headers }
                );

                const fetchedPlaylist = data?.data || null;
                setPlaylist(fetchedPlaylist);
                return fetchedPlaylist;
            } catch (err) {
                // Retry logic for network errors
                if (err.request && retryCount < 2) {
                    console.log(
                        `Retrying playlist fetch (attempt ${retryCount + 1})`
                    );
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * (retryCount + 1))
                    );
                    return fetchPlaylist(playlistId, retryCount + 1);
                }

                handleError(err, "fetch playlist");
                setPlaylist(null);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [
            initialPlaylistId,
            isAuthenticated,
            getAuthHeaders,
            handleError,
            clearError,
        ]
    );

    // Create a new playlist with validation
    const createPlaylist = useCallback(
        async (playlistData, videoId = null) => {
            if (!isAuthenticated) {
                const errorMsg = "You must be logged in to create playlists";
                toast.error(errorMsg);
                setError(errorMsg);
                return null;
            }

            // Validate input data
            if (!playlistData?.name?.trim()) {
                const errorMsg = "Playlist name is required";
                toast.error(errorMsg);
                setError(errorMsg);
                return null;
            }

            if (playlistData.name.length > 100) {
                const errorMsg =
                    "Playlist name must be less than 100 characters";
                toast.error(errorMsg);
                setError(errorMsg);
                return null;
            }

            try {
                setLoading(true);
                clearError();

                const headers = getAuthHeaders();
                const url = videoId
                    ? `/api/v1/playlists/create/${videoId}`
                    : "/api/v1/playlists/create";

                // Clean the data
                const cleanData = {
                    name: playlistData.name.trim(),
                    description: playlistData.description?.trim() || "",
                };

                const { data } = await axios.post(url, cleanData, { headers });

                const newPlaylist = data?.data || null;
                if (newPlaylist) {
                    setPlaylists((prev) => [newPlaylist, ...prev]);
                    toast.success("Playlist created successfully");
                }

                return newPlaylist;
            } catch (err) {
                handleError(err, "create playlist");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, getAuthHeaders, handleError, clearError]
    );

    // Update a playlist with optimistic updates and rollback
    const updatePlaylist = useCallback(
        async (playlistId, updateData) => {
            if (!isAuthenticated || !playlistId) {
                const errorMsg = "Authentication required to update playlist";
                setError(errorMsg);
                return false;
            }

            // Validate input
            if (updateData.name && !updateData.name.trim()) {
                const errorMsg = "Playlist name cannot be empty";
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            }

            // Store original state for rollback
            const originalPlaylist = playlist;
            const originalPlaylists = [...playlists];

            try {
                setLoading(true);
                clearError();

                // Optimistic update
                const optimisticData = {
                    ...playlist,
                    ...updateData,
                    name: updateData.name?.trim() || playlist?.name,
                    description:
                        updateData.description?.trim() || playlist?.description,
                };

                if (playlist && playlist._id === playlistId) {
                    setPlaylist(optimisticData);
                }

                setPlaylists((prev) =>
                    prev.map((p) => (p._id === playlistId ? optimisticData : p))
                );

                const headers = getAuthHeaders();
                const cleanData = {
                    name: updateData.name?.trim(),
                    description: updateData.description?.trim(),
                };

                const { data } = await axios.put(
                    `/api/v1/playlists/update/${playlistId}`,
                    cleanData,
                    { headers }
                );

                const updatedPlaylist = data?.data || null;

                // Update with server response
                if (playlist && playlist._id === playlistId) {
                    setPlaylist(updatedPlaylist);
                }

                setPlaylists((prev) =>
                    prev.map((p) =>
                        p._id === playlistId ? updatedPlaylist : p
                    )
                );

                toast.success("Playlist updated successfully");
                return true;
            } catch (err) {
                // Rollback optimistic update
                setPlaylist(originalPlaylist);
                setPlaylists(originalPlaylists);
                handleError(err, "update playlist");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [
            isAuthenticated,
            playlist,
            getAuthHeaders,
            handleError,
            clearError,
        ]
    );

    // Delete a playlist with confirmation state
    const deletePlaylist = useCallback(
        async (playlistId) => {
            if (!isAuthenticated || !playlistId) {
                const errorMsg = "Authentication required to delete playlist";
                setError(errorMsg);
                return false;
            }

            try {
                setLoading(true);
                clearError();

                const headers = getAuthHeaders();
                await axios.delete(`/api/v1/playlists/delete/${playlistId}`, {
                    headers,
                });

                // Update state
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
                handleError(err, "delete playlist");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, playlist, getAuthHeaders, handleError, clearError]
    );

    // Add video to playlist with duplicate checking
    const addVideo = useCallback(
        async (videoId, playlistId = playlist?._id) => {
            if (!isAuthenticated || !playlistId || !videoId) {
                const errorMsg = "Missing required information to add video";
                setError(errorMsg);
                return false;
            }

            // Check for duplicates before API call
            const targetPlaylist =
                playlist?._id === playlistId
                    ? playlist
                    : playlists.find((p) => p._id === playlistId);

            if (
                targetPlaylist?.videos?.some((video) => {
                    const id = typeof video === "string" ? video : video._id;
                    return id === videoId;
                })
            ) {
                toast.info("Video is already in this playlist");
                return false;
            }

            try {
                setLoading(true);
                clearError();

                const headers = getAuthHeaders();
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
                handleError(err, "add video to playlist");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [
            isAuthenticated,
            playlist,
            playlists,
            getAuthHeaders,
            handleError,
            clearError,
        ]
    );

    // Remove video from playlist
    const removeVideo = useCallback(
        async (videoId, playlistId = playlist?._id) => {
            if (!isAuthenticated || !playlistId || !videoId) {
                const errorMsg = "Missing required information to remove video";
                setError(errorMsg);
                return false;
            }

            try {
                setLoading(true);
                clearError();

                const headers = getAuthHeaders();
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
                handleError(err, "remove video from playlist");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [
            isAuthenticated,
            playlist,
            playlists,
            getAuthHeaders,
            handleError,
            clearError,
        ]
    );

    // Check if a video is in a playlist
    const isVideoInPlaylist = useCallback(
        (videoId, playlistId = playlist?._id) => {
            if (!playlistId || !videoId) return false;

            // Check in current playlist first
            if (playlist && playlist._id === playlistId) {
                return playlist.videos?.some((video) => {
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
        // State
        playlists,
        playlist,
        loading,
        error,

        // Methods
        fetchUserPlaylists,
        fetchPlaylist,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addVideo,
        removeVideo,
        isVideoInPlaylist,

        // Error handling
        clearError,

        // Aliases for consistency
        addVideoToPlaylist: addVideo,
        removeVideoFromPlaylist: removeVideo,

        // Setters for manual state management if needed
        setPlaylist,
        setPlaylists,
    };
};

export default usePlaylist;
