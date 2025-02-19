import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFilm, FaListUl } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fetch user's playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get("/api/v1/playlists", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });
                setPlaylists(data.data.playlists);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to fetch playlists"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    // Create new playlist
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/v1/playlists", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
            });
            setPlaylists([...playlists, data.data.playlist]);
            setShowCreateModal(false);
            setFormData({ name: "", description: "" });
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to create playlist"
            );
        }
    };

    // Update playlist
    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.patch(
                `/api/v1/playlists/${selectedPlaylist._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylists(
                playlists.map((p) =>
                    p._id === data.data.playlist._id ? data.data.playlist : p
                )
            );
            setShowEditModal(false);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to update playlist"
            );
        }
    };

    // Delete playlist
    const handleDeletePlaylist = async (id) => {
        if (window.confirm("Are you sure you want to delete this playlist?")) {
            try {
                await axios.delete(`/api/v1/playlists/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });
                setPlaylists(playlists.filter((p) => p._id !== id));
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to delete playlist"
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FaListUl className="text-orange-500" />
                    Your Playlists
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                    <FaPlus /> Create New
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-500/20 text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            {/* Playlist Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse bg-gray-800 h-48 rounded-xl"
                        />
                    ))
                ) : playlists.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-12">
                        No playlists found. Create one to get started!
                    </div>
                ) : (
                    playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all relative group"
                        >
                            {/* Thumbnail Preview */}
                            <div className="mb-4 relative">
                                {playlist.videos.length > 0 ? (
                                    <img
                                        src={playlist.videos[0].thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <FaFilm className="text-3xl text-gray-500" />
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-gray-900/80 px-3 py-1 rounded-full text-sm">
                                    {playlist.videos.length} videos
                                </div>
                            </div>

                            {/* Playlist Info */}
                            <h3 className="text-xl font-semibold mb-2 truncate">
                                {playlist.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {playlist.description || "No description"}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() =>
                                        navigate(`/playlist/${playlist._id}`)
                                    }
                                    className="text-orange-500 hover:text-orange-400 flex items-center gap-2"
                                >
                                    View Playlist →
                                </button>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setSelectedPlaylist(playlist);
                                            setFormData({
                                                name: playlist.name,
                                                description:
                                                    playlist.description,
                                            });
                                            setShowEditModal(true);
                                        }}
                                        className="p-2 hover:bg-gray-700 rounded-lg"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeletePlaylist(playlist._id)
                                        }
                                        className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FaPlus /> Create New Playlist
                        </h2>
                        <form onSubmit={handleCreatePlaylist}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-2">
                                        Playlist Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-700 rounded-lg p-3"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full bg-gray-700 rounded-lg p-3 h-24"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                        className="px-4 py-2 hover:bg-gray-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Playlist Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FaEdit /> Edit Playlist
                        </h2>
                        <form onSubmit={handleUpdatePlaylist}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-2">
                                        Playlist Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-700 rounded-lg p-3"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full bg-gray-700 rounded-lg p-3 h-24"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 hover:bg-gray-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlist;
