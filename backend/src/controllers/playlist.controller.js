import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Create a playlist
const createPlaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body;
    const { videoId } = req.params;
    
    if (!name || name.trim().length < 1) {
        throw new APIerror(400, "Name is required");
    }

    if (videoId) {
        console.log(videoId);
        if (!mongoose.isValidObjectId(videoId)) {
            throw new APIerror(400, "Invalid video ID");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            throw new APIerror(404, "Video not found");
        }
    }

    const playlist = await Playlist.create({
        owner: req.user._id,
        name: name.trim(),
        description: description?.trim() || "",
        videos: [videoId],
    });

    return res
        .status(201)
        .json(new APIresponse(201, playlist, "Playlist successfully created"));
});

// Get all playlists for the authenticated user
const getUserPlaylists = asynchandler(async (req, res) => {
    console.log(req.user._id);
    const playlists = await Playlist.find({ owner: req.user._id }).sort({
        createdAt: -1,
    });

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                playlists,
                "User playlists fetched successfully"
            )
        );
});

// Get a playlist by ID
const getPlaylistById = asynchandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new APIerror(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "title description thumbnail")
        .populate("owner", "username email");

    if (!playlist) {
        throw new APIerror(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new APIresponse(200, playlist, "Playlist fetched successfully"));
});

// Add a video to a playlist
const addVideoToPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (
        !mongoose.isValidObjectId(playlistId) ||
        !mongoose.isValidObjectId(videoId)
    ) {
        throw new APIerror(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIerror(404, "Playlist not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }

    if (playlist.videos.includes(videoId)) {
        throw new APIerror(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                playlist,
                "Video added to playlist successfully"
            )
        );
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (
        !mongoose.isValidObjectId(playlistId) ||
        !mongoose.isValidObjectId(videoId)
    ) {
        throw new APIerror(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIerror(404, "Playlist not found");
    }

    playlist.videos = playlist.videos.filter(
        (video) => video.toString() !== videoId
    );
    await playlist.save();

    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                playlist,
                "Video removed from playlist successfully"
            )
        );
});

// Delete a playlist
const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new APIerror(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id,
    });

    if (!playlist) {
        throw new APIerror(
            404,
            "Playlist not found or you don't own this playlist"
        );
    }

    return res
        .status(200)
        .json(new APIresponse(200, null, "Playlist deleted successfully"));
});

// Update a playlist (name and/or description)
const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new APIerror(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id },
        { name: name?.trim(), description: description?.trim() },
        { new: true, runValidators: true }
    );

    if (!playlist) {
        throw new APIerror(
            404,
            "Playlist not found or you don't own this playlist"
        );
    }

    return res
        .status(200)
        .json(new APIresponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
