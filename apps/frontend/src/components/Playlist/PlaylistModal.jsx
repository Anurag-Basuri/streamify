import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FiPlus } from "react-icons/fi";

export const PlaylistModal = ({
    onClose,
    playlists,
    newPlaylistName,
    setNewPlaylistName,
    onPlaylistAction,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl w-full max-w-md p-6"
            >
                <h3 className="text-xl font-bold text-white mb-4">
                    Save to Playlist
                </h3>

                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {playlists.map((playlist) => (
                        <button
                            key={playlist._id}
                            onClick={() =>
                                onPlaylistAction("add", playlist._id)
                            }
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                        >
                            <span>{playlist.name}</span>
                            <FiPlus className="w-5 h-5" />
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="New playlist name"
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={() => onPlaylistAction("create")}
                        disabled={!newPlaylistName.trim()}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

PlaylistModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    playlists: PropTypes.array.isRequired,
    newPlaylistName: PropTypes.string.isRequired,
    setNewPlaylistName: PropTypes.func.isRequired,
    onPlaylistAction: PropTypes.func.isRequired,
};