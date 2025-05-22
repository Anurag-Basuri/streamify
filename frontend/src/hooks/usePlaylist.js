import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const usePlaylist = (playlistId, user) => {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Memoized fetch function to avoid unnecessary re-renders
    const fetchPlaylist = useCallback(async () => {
        if (!playlistId || !user) return;

        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get(
                `/api/v1/playlists/${playlistId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylist(data.data);
            setError("");
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to load playlist";
            setError(errorMessage);
            console.error("Playlist fetch error:", err);

            // Only show toast for non-404 errors to avoid spam
            if (err.response?.status !== 404) {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [playlistId, user]);

    // Auto-fetch when playlistId or user changes
    useEffect(() => {
        if (playlistId && user) {
            fetchPlaylist();
        }
    }, [fetchPlaylist]);

    // Add video to playlist
    const addVideo = useCallback(
        async (videoId) => {
            if (!playlistId || !videoId || !user || actionLoading) {
                return false;
            }

            setActionLoading(true);

            try {
                const { data } = await axios.post(
                    `/api/v1/playlists/${playlistId}/videos/${videoId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "accessToken"
                            )}`,
                        },
                    }
                );

                // Update playlist state optimistically
                setPlaylist((prev) => {
                    if (!prev) return prev;

                    // Check if video is already in playlist to avoid duplicates
                    const videoExists = prev.videos.some(
                        (v) => (typeof v === "string" ? v : v._id) === videoId
                    );

                    if (videoExists) return prev;

                    return {
                        ...prev,
                        videos: [...prev.videos, videoId], // Add videoId, backend returns updated playlist
                    };
                });

                toast.success("Video added to playlist");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to add video";
                toast.error(errorMessage);
                console.error("Add video error:", err);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [playlistId, user, actionLoading]
    );

    // Remove video from playlist
    const removeVideo = useCallback(
        async (videoId) => {
            if (!playlistId || !videoId || !user || actionLoading) {
                return false;
            }

            setActionLoading(true);

            try {
                await axios.delete(
                    `/api/v1/playlists/remove/${playlistId}/videos/${videoId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "accessToken"
                            )}`,
                        },
                    }
                );

                // Update playlist state optimistically
                setPlaylist((prev) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        videos: prev.videos.filter(
                            (v) =>
                                (typeof v === "string" ? v : v._id) !== videoId
                        ),
                    };
                });

                toast.success("Video removed from playlist");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to remove video";
                toast.error(errorMessage);
                console.error("Remove video error:", err);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [playlistId, user, actionLoading]
    );

    // Update playlist details (name, description)
    const updatePlaylist = useCallback(
        async (updates) => {
            if (!playlistId || !user || actionLoading) {
                return false;
            }

            setActionLoading(true);

            try {
                const { data } = await axios.put(
                    `/api/v1/playlists/update/${playlistId}`,
                    updates,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "accessToken"
                            )}`,
                        },
                    }
                );

                setPlaylist(data.data);
                toast.success("Playlist updated successfully");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to update playlist";
                toast.error(errorMessage);
                console.error("Update playlist error:", err);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [playlistId, user, actionLoading]
    );

    // Delete playlist
    const deletePlaylist = useCallback(async () => {
        if (!playlistId || !user || actionLoading) {
            return false;
        }

        setActionLoading(true);

        try {
            await axios.delete(`/api/v1/playlists/delete/${playlistId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
            });

            setPlaylist(null);
            toast.success("Playlist deleted successfully");
            return true;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to delete playlist";
            toast.error(errorMessage);
            console.error("Delete playlist error:", err);
            return false;
        } finally {
            setActionLoading(false);
        }
    }, [playlistId, user, actionLoading]);

    // Check if a video exists in the playlist
    const isVideoInPlaylist = useCallback(
        (videoId) => {
            if (!playlist || !playlist.videos) return false;

            return playlist.videos.some(
                (v) => (typeof v === "string" ? v : v._id) === videoId
            );
        },
        [playlist]
    );

    // Reset hook state
    const reset = useCallback(() => {
        setPlaylist(null);
        setLoading(false);
        setError("");
        setActionLoading(false);
    }, []);

    return {
        playlist,
        loading,
        error,
        actionLoading,
        fetchPlaylist,
        addVideo,
        removeVideo,
        updatePlaylist,
        deletePlaylist,
        isVideoInPlaylist,
        reset,
        setPlaylist, // Keep for manual updates if needed
    };
};

export default usePlaylist;
