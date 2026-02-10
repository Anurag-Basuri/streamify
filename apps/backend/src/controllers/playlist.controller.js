/**
 * Playlist Controller
 * Handles all playlist-related operations
 */
import mongoose from "mongoose";

// Models
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

// Utils
import { asyncHandler } from "../utils/asynchandler.js";
import {
    ok,
    created,
    badRequest,
    notFound,
    forbidden,
    ensureExists,
    ensureOwner,
} from "../utils/responseHelpers.js";
import { PLAYLIST } from "../utils/errorCodes.js";

// ============================================================================
// HELPERS
// ============================================================================

const validateObjectId = (id, fieldName = "ID") => {
    if (!mongoose.isValidObjectId(id)) {
        badRequest(`Invalid ${fieldName}`, [], "INVALID_OBJECT_ID");
    }
};

// ============================================================================
// CONTROLLERS
// ============================================================================

/**
 * Create a new playlist
 * POST /playlists/create/:videoId?
 */
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;
    const { videoId } = req.params;

    if (!name?.trim()) {
        badRequest("Name is required", [], "REQUIRED_FIELD");
    }

    // Prepare videos array
    const videos = [];

    if (videoId) {
        validateObjectId(videoId, "video ID");
        const video = await Video.findById(videoId);
        ensureExists(video, "Video");
        videos.push(videoId);
    }

    const playlist = await Playlist.create({
        owner: req.user._id,
        name: name.trim(),
        description: description?.trim() || "",
        videos,
        isPublic: isPublic === true,
    });

    return created(res, playlist, "Playlist successfully created");
});

/**
 * Get all playlists for the authenticated user
 * GET /playlists
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

    return ok(res, playlists, "User playlists fetched successfully");
});

/**
 * Get a playlist by ID
 * GET /playlists/:playlistId
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    validateObjectId(playlistId, "playlist ID");

    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "title description thumbnail duration views")
        .populate("owner", "userName email avatar");

    ensureExists(playlist, "Playlist");

    // Check access: public playlists visible to all, private only to owner
    const isOwner =
        req.user && playlist.owner._id.toString() === req.user._id.toString();

    if (!playlist.isPublic && !isOwner) {
        forbidden("This playlist is private", PLAYLIST.PRIVATE);
    }

    return ok(
        res,
        { ...playlist.toObject(), isOwner },
        "Playlist fetched successfully"
    );
});

/**
 * Add a video to a playlist
 * POST /playlists/:playlistId/videos/:videoId
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    validateObjectId(playlistId, "playlist ID");
    validateObjectId(videoId, "video ID");

    const playlist = await Playlist.findById(playlistId);
    ensureExists(playlist, "Playlist");
    ensureOwner(playlist.owner, req.user._id, "playlist");

    const video = await Video.findById(videoId);
    ensureExists(video, "Video");

    if (playlist.videos.includes(videoId)) {
        badRequest(
            "Video already in playlist",
            [],
            PLAYLIST.VIDEO_ALREADY_EXISTS
        );
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return ok(res, playlist, "Video added to playlist successfully");
});

/**
 * Remove a video from a playlist
 * DELETE /playlists/remove/:playlistId/videos/:videoId
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    validateObjectId(playlistId, "playlist ID");
    validateObjectId(videoId, "video ID");

    const playlist = await Playlist.findById(playlistId);
    ensureExists(playlist, "Playlist");
    ensureOwner(playlist.owner, req.user._id, "playlist");

    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
    await playlist.save();

    return ok(res, playlist, "Video removed from playlist successfully");
});

/**
 * Delete a playlist
 * DELETE /playlists/delete/:playlistId
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    validateObjectId(playlistId, "playlist ID");

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id,
    });

    if (!playlist) {
        notFound("Playlist", PLAYLIST.NOT_FOUND);
    }

    return ok(res, null, "Playlist deleted successfully");
});

/**
 * Update a playlist
 * PUT /playlists/update/:playlistId
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;
    validateObjectId(playlistId, "playlist ID");

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (typeof isPublic === "boolean") updateData.isPublic = isPublic;

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id },
        updateData,
        { new: true, runValidators: true }
    );

    if (!playlist) {
        notFound("Playlist", PLAYLIST.NOT_FOUND);
    }

    return ok(res, playlist, "Playlist updated successfully");
});

/**
 * Reorder videos in a playlist
 * PUT /playlists/:playlistId/reorder
 */
const reorderPlaylistVideos = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;
    validateObjectId(playlistId, "playlist ID");

    if (!Array.isArray(videoIds)) {
        badRequest("videoIds must be an array", [], "INVALID_FORMAT");
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user._id,
    });

    if (!playlist) {
        notFound("Playlist", PLAYLIST.NOT_FOUND);
    }

    // Validate all video IDs exist in the playlist
    const currentVideoIds = playlist.videos.map((v) => v.toString());
    const validVideoIds = videoIds.filter((id) => currentVideoIds.includes(id));

    if (validVideoIds.length !== currentVideoIds.length) {
        badRequest(
            "Invalid video IDs or missing videos",
            [],
            PLAYLIST.VIDEO_NOT_FOUND
        );
    }

    playlist.videos = validVideoIds;
    await playlist.save();

    return ok(res, playlist, "Playlist reordered successfully");
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    reorderPlaylistVideos,
};
