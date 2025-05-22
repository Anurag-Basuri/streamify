import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const usePlaylists = (user) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch all user playlists
    const fetchPlaylists = useCallback(async () => {
        if (!user) {
            setPlaylists([]);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get(`/api/v1/playlists/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
            });
            setPlaylists(data.data || []);
            setError("");
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to load playlists";
            setError(errorMessage);
            console.error("Playlists fetch error:", err);

            if (err.response?.status !== 404) {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Auto-fetch when user changes
    useEffect(() => {
        if (user) {
            fetchPlaylists();
        } else {
            setPlaylists([]);
        }
    }, [fetchPlaylists, user]);

    // Create new playlist
    const createPlaylist = useCallback(
        async (playlistData, videoId = null) => {
            if (!user || actionLoading) return false;

            setActionLoading(true);

            try {
                const endpoint = videoId
                    ? `/api/v1/playlists/create/${videoId}`
                    : `/api/v1/playlists/create`;

                const { data } = await axios.post(endpoint, playlistData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });

                // Add new playlist to the list
                setPlaylists((prev) => [data.data, ...prev]);
                toast.success("Playlist created successfully");
                return data.data;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Failed to create playlist";
                toast.error(errorMessage);
                console.error("Create playlist error:", err);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [user, actionLoading]
    );

    // Add video to specific playlist
    const addVideoToPlaylist = useCallback(
        async (playlistId, videoId) => {
            if (!user || !playlistId || !videoId || actionLoading) return false;

            setActionLoading(true);

            try {
                await axios.post(
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

                // Update the specific playlist in the list
                setPlaylists((prev) =>
                    prev.map((playlist) =>
                        playlist._id === playlistId
                            ? {
                                  ...playlist,
                                  videos: [...playlist.videos, videoId],
                              }
                            : playlist
                    )
                );

                toast.success("Video added to playlist");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Failed to add video to playlist";
                toast.error(errorMessage);
                console.error("Add video to playlist error:", err);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [user, actionLoading]
    );

    // Remove video from specific playlist
    const removeVideoFromPlaylist = useCallback(
        async (playlistId, videoId) => {
            if (!user || !playlistId || !videoId || actionLoading) return false;

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

                // Update the specific playlist in the list
                setPlaylists((prev) =>
                    prev.map((playlist) =>
                        playlist._id === playlistId
                            ? {
                                  ...playlist,
                                  videos: playlist.videos.filter(
                                      (v) =>
                                          (typeof v === "string"
                                              ? v
                                              : v._id) !== videoId
                                  ),
                              }
                            : playlist
                    )
                );

                toast.success("Video removed from playlist");
                return true;
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Failed to remove video from playlist";
                toast.error(errorMessage);
                console.error("Remove video from playlist error:", err);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [user, actionLoading]
    );

    // Delete playlist
    const deletePlaylist = useCallback(
        async (playlistId) => {
            if (!user || !playlistId || actionLoading) return false;

            setActionLoading(true);

            try {
                await axios.delete(`/api/v1/playlists/delete/${playlistId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });

                // Remove playlist from the list
                setPlaylists((prev) =>
                    prev.filter((playlist) => playlist._id !== playlistId)
                );
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
        },
        [user, actionLoading]
    );

    // Update playlist
    const updatePlaylist = useCallback(
        async (playlistId, updates) => {
            if (!user || !playlistId || actionLoading) return false;

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

                // Update the specific playlist in the list
                setPlaylists((prev) =>
                    prev.map((playlist) =>
                        playlist._id === playlistId ? data.data : playlist
                    )
                );

                toast.success("Playlist updated successfully");
                return data.data;
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
        [user, actionLoading]
    );

    // Check if video exists in any playlist
    const getPlaylistsContainingVideo = useCallback(
        (videoId) => {
            return playlists.filter((playlist) =>
                playlist.videos.some(
                    (v) => (typeof v === "string" ? v : v._id) === videoId
                )
            );
        },
        [playlists]
    );

    // Check if video exists in specific playlist
    const isVideoInPlaylist = useCallback(
        (playlistId, videoId) => {
            const playlist = playlists.find((p) => p._id === playlistId);
            if (!playlist) return false;

            return playlist.videos.some(
                (v) => (typeof v === "string" ? v : v._id) === videoId
            );
        },
        [playlists]
    );

    return {
        playlists,
        loading,
        error,
        actionLoading,
        fetchPlaylists,
        createPlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        deletePlaylist,
        updatePlaylist,
        getPlaylistsContainingVideo,
        isVideoInPlaylist,
    };
};

export default usePlaylists;
