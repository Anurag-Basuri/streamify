import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = express.Router();

// Middleware to verify user authentication
router.use(verifyAccessToken);

// Routes
// Create a playlist (optionally with a video)
router.post("/create/:videoId?", createPlaylist);

// Get all playlists for the authenticated user
router.get("/", getUserPlaylists);

// Get a playlist by its ID
router.get("/:playlistId", getPlaylistById);

// Add a video to a playlist
router.post("/:playlistId/videos/:videoId", addVideoToPlaylist);

// Remove a video from a playlist
router.delete("/remove/:playlistId/videos/:videoId", removeVideoFromPlaylist);

// Delete a playlist
router.delete("/delete/:playlistId", deletePlaylist);

// Update a playlist's name or description
router.put("/update/:playlistId", updatePlaylist);

export default router;