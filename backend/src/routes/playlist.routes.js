import express from "express";
import {
    requireAuth,
    verifyAccessToken,
} from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    reorderPlaylistVideos,
} from "../controllers/playlist.controller.js";

const router = express.Router();

// Routes
// Create a playlist (optionally with a video)
router.post("/create/:videoId?", requireAuth, createPlaylist);

// Get all playlists for the authenticated user
router.get("/", requireAuth, getUserPlaylists);

// Get a playlist by its ID
router.get("/:playlistId", verifyAccessToken, getPlaylistById);

// Add a video to a playlist
router.post("/:playlistId/videos/:videoId", requireAuth, addVideoToPlaylist);

// Remove a video from a playlist
router.delete(
    "/remove/:playlistId/videos/:videoId",
    requireAuth,
    removeVideoFromPlaylist
);

// Delete a playlist
router.delete("/delete/:playlistId", requireAuth, deletePlaylist);

// Update a playlist's name, description, or visibility
router.put("/update/:playlistId", requireAuth, updatePlaylist);

// Reorder videos in a playlist
router.put("/:playlistId/reorder", requireAuth, reorderPlaylistVideos);

export default router;
