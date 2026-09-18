package com.streamify.modules.playlist;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.playlist.PlaylistService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/playlists")
@Tag(name = "Playlists", description = "Playlist CRUD and video management")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping
    @Operation(summary = "Create a playlist")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPlaylist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        Map<String, Object> playlist = playlistService.createPlaylist(
                principal.getId(),
                (String) body.get("name"),
                (String) body.get("description"),
                body.get("isPublic") != null && (boolean) body.get("isPublic")
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(playlist, "Playlist created successfully"));
    }

    @GetMapping("/{playlistId}")
    @Operation(summary = "Get playlist with videos")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlaylist(
            @PathVariable UUID playlistId,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        Map<String, Object> playlist = playlistService.getPlaylistById(playlistId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(playlist));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get playlists by user")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getUserPlaylists(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<Map<String, Object>> playlists = playlistService.getUserPlaylists(userId, currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(playlists));
    }

    @PatchMapping("/{playlistId}")
    @Operation(summary = "Update a playlist")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePlaylist(
            @PathVariable UUID playlistId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        Map<String, Object> playlist = playlistService.updatePlaylist(
                playlistId, principal.getId(),
                (String) body.get("name"),
                (String) body.get("description"),
                body.get("isPublic") != null ? (Boolean) body.get("isPublic") : null
        );
        return ResponseEntity.ok(ApiResponse.ok(playlist, "Playlist updated successfully"));
    }

    @DeleteMapping("/{playlistId}")
    @Operation(summary = "Delete a playlist")
    public ResponseEntity<ApiResponse<Void>> deletePlaylist(
            @PathVariable UUID playlistId,
            @AuthenticationPrincipal UserPrincipal principal) {

        playlistService.deletePlaylist(playlistId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Playlist deleted successfully"));
    }

    @PostMapping("/{playlistId}/videos/{videoId}")
    @Operation(summary = "Add a video to a playlist")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addVideo(
            @PathVariable UUID playlistId,
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Map<String, Object> result = playlistService.addVideo(playlistId, videoId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @DeleteMapping("/{playlistId}/videos/{videoId}")
    @Operation(summary = "Remove a video from a playlist")
    public ResponseEntity<ApiResponse<Void>> removeVideo(
            @PathVariable UUID playlistId,
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {

        playlistService.removeVideo(playlistId, videoId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Video removed from playlist"));
    }

    @PostMapping("/create")
    @Operation(summary = "Create a playlist (Alias)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPlaylistAlias(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        return createPlaylist(principal, body);
    }

    @PatchMapping("/update/{playlistId}")
    @Operation(summary = "Update a playlist (Alias)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePlaylistAlias(
            @PathVariable UUID playlistId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        return updatePlaylist(playlistId, principal, body);
    }

    @DeleteMapping("/delete/{playlistId}")
    @Operation(summary = "Delete a playlist (Alias)")
    public ResponseEntity<ApiResponse<Void>> deletePlaylistAlias(
            @PathVariable UUID playlistId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return deletePlaylist(playlistId, principal);
    }

    @PatchMapping("/remove/{videoId}/{playlistId}")
    @Operation(summary = "Remove a video from a playlist (Alias)")
    public ResponseEntity<ApiResponse<Void>> removeVideoAlias(
            @PathVariable UUID playlistId,
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return removeVideo(playlistId, videoId, principal);
    }
}
