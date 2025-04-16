import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFilm,
    FaListUl,
    FaRegSadTear,
    FaPlay,
    FaTimes,
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Fetch playlists with debounced search
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const { data } = await axios.get("/api/v1/playlists", {
                    params: { search: searchQuery },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });
                setPlaylists(data.data.playlists);
            } catch (err) {
                handleError(err, "Failed to fetch playlists");
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchPlaylists, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleError = (err, defaultMessage) => {
        const message = err.response?.data?.message || defaultMessage;
        toast.error(message);
    };

    const handlePlaylistAction = async (e, action) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Name is required");

        try {
            const methods = {
                create: {
                    url: "/api/v1/playlists/create",
                    method: "post",
                    success: "Playlist created 🎉",
                },
                edit: {
                    url: `/api/v1/playlists/${selectedPlaylist._id}`,
                    method: "patch",
                    success: "Playlist updated ✨",
                },
            };

            const { data } = await axios[methods[action].method](
                methods[action].url,
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
                action === "create"
                    ? [data.data.playlist, ...playlists]
                    : playlists.map((p) =>
                          p._id === data.data.playlist._id
                              ? data.data.playlist
                              : p
                      )
            );

            toast.success(methods[action].success);
            setModalType(null);
            setFormData({ name: "", description: "" });
        } catch (err) {
            handleError(err, `Failed to ${action} playlist`);
        }
    };

    const deletePlaylist = async () => {
        try {
            await axios.delete(
                `/api/v1/playlists/delete/${selectedPlaylist._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );
            setPlaylists(
                playlists.filter((p) => p._id !== selectedPlaylist._id)
            );
            toast.success("Playlist deleted 🗑️");
            setModalType(null);
        } catch (err) {
            handleError(err, "Failed to delete playlist");
        }
    };

    const ThumbnailGrid = ({ videos }) => {
        const [hoverIndex, setHoverIndex] = useState(-1);

        return (
            <div className="grid grid-cols-2 gap-1 h-48 rounded-2xl overflow-hidden relative group">
                {videos?.slice(0, 4).map((video, idx) => (
                    <motion.div
                        key={video._id}
                        className="relative"
                        onHoverStart={() => setHoverIndex(idx)}
                        onHoverEnd={() => setHoverIndex(-1)}
                    >
                        <img
                            src={video.thumbnail || "/default-thumbnail.jpg"}
                            className="w-full h-full object-cover"
                            alt="Video thumbnail"
                        />
                        <AnimatePresence>
                            {hoverIndex === idx && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                                >
                                    <FaPlay className="text-2xl text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {idx === 3 && videos.length > 4 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-2xl backdrop-blur-sm">
                                +{videos.length - 4}
                            </div>
                        )}
                    </motion.div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        );
    };

    const PlaylistCard = ({ playlist }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition-all shadow-2xl hover:shadow-purple-500/10"
        >
            <div className="relative mb-5 overflow-hidden rounded-xl">
                <ThumbnailGrid videos={playlist.videos} />
                <div className="absolute bottom-3 right-3 bg-gray-900/80 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {playlist.videos?.length || 0} videos
                </div>
            </div>

            <h3 className="text-xl font-bold truncate mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {playlist.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-5 min-h-[3rem]">
                {playlist.description || "No description"}
            </p>

            <div className="flex justify-between items-center">
                <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
                >
                    <span>Explore</span>
                    <FiChevronRight className="text-lg mt-0.5" />
                </motion.button>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setSelectedPlaylist(playlist);
                            setFormData(playlist);
                            setModalType("edit");
                        }}
                        className="p-2 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-purple-400"
                    >
                        <FaEdit className="text-lg" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setSelectedPlaylist(playlist);
                            setModalType("delete");
                        }}
                        className="p-2 hover:bg-gray-700 rounded-xl text-red-400 hover:text-red-300"
                    >
                        <FaTrash className="text-lg" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-800/50 p-6 rounded-2xl backdrop-blur-lg border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <FaListUl className="text-3xl text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                My Playlists
                            </h1>
                            <input
                                type="text"
                                placeholder="Search playlists..."
                                className="mt-2 bg-gray-700/50 rounded-lg p-2 text-sm w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalType("create")}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-medium flex items-center gap-3 w-full sm:w-auto justify-center"
                    >
                        <FaPlus />
                        New Playlist
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gray-800 rounded-2xl p-5"
                                >
                                    <div className="animate-pulse bg-gray-700/50 h-48 rounded-xl mb-5" />
                                    <div className="h-6 bg-gray-700/50 rounded-lg w-3/4 mb-4" />
                                    <div className="h-4 bg-gray-700/50 rounded-lg w-full mb-2" />
                                    <div className="h-4 bg-gray-700/50 rounded-lg w-2/3" />
                                </motion.div>
                            ))
                        ) : playlists.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full text-center py-20 space-y-6"
                            >
                                <div className="inline-flex flex-col items-center">
                                    <FaRegSadTear className="text-6xl text-purple-400 mb-4" />
                                    <div className="text-4xl mb-2">📼</div>
                                </div>
                                <h2 className="text-2xl text-gray-300">
                                    No Playlists Found
                                </h2>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Start by creating your first collection of
                                    awesome videos!
                                </p>
                            </motion.div>
                        ) : (
                            playlists.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {modalType && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setModalType(null)}
                        >
                            {["create", "edit"].includes(modalType) ? (
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/20 relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h2 className="text-2xl font-bold mb-6">
                                        {modalType === "create"
                                            ? "Create New"
                                            : "Edit"}{" "}
                                        Playlist
                                    </h2>
                                    <form
                                        onSubmit={(e) =>
                                            handlePlaylistAction(e, modalType)
                                        }
                                    >
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-sm mb-2">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-gray-700 rounded-lg p-3"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    className="w-full bg-gray-700 rounded-lg p-3 h-32"
                                                    value={formData.description}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setModalType(null)
                                                }
                                                className="px-5 py-2 hover:bg-gray-700/50 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
                                            >
                                                {modalType === "create"
                                                    ? "Create"
                                                    : "Save"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                modalType === "delete" && (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-red-500/20 relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="text-center mb-6">
                                            <div className="inline-flex bg-red-500/20 p-4 rounded-xl mb-4">
                                                <FaTrash className="text-3xl text-red-400" />
                                            </div>
                                            <h2 className="text-2xl font-bold mb-2">
                                                Delete Playlist?
                                            </h2>
                                            <p className="text-gray-400">
                                                Are you sure you want to delete
                                                "{selectedPlaylist?.name}"?
                                            </p>
                                        </div>
                                        <div className="flex gap-4 justify-center">
                                            <button
                                                onClick={() =>
                                                    setModalType(null)
                                                }
                                                className="px-5 py-2 hover:bg-gray-700/50 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={deletePlaylist}
                                                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Playlist;