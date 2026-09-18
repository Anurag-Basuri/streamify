package com.streamify.modules.playlist;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.playlist.Playlist;
import com.streamify.modules.playlist.PlaylistVideo;
import com.streamify.modules.playlist.PlaylistRepository;
import com.streamify.modules.playlist.PlaylistVideoRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import com.streamify.modules.video.Video;
import com.streamify.modules.video.VideoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistVideoRepository playlistVideoRepository;
    private final UserService userService;
    private final VideoService videoService;

    public PlaylistService(PlaylistRepository playlistRepository,
                           PlaylistVideoRepository playlistVideoRepository,
                           UserService userService,
                           VideoService videoService) {
        this.playlistRepository = playlistRepository;
        this.playlistVideoRepository = playlistVideoRepository;
        this.userService = userService;
        this.videoService = videoService;
    }

    public Map<String, Object> createPlaylist(UUID userId, String name, String description, boolean isPublic) {
        User user = userService.findUserById(userId);
        Playlist playlist = new Playlist();
        playlist.setOwner(user);
        playlist.setName(name);
        playlist.setDescription(description);
        playlist.setPublic(isPublic);
        playlist = playlistRepository.save(playlist);
        return toPlaylistMap(playlist);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlaylistById(UUID playlistId, UUID currentUserId) {
        Playlist playlist = findPlaylistById(playlistId);

        if (!playlist.isPublic() && (currentUserId == null || !playlist.getOwner().getId().equals(currentUserId))) {
            throw ApiException.forbidden("This playlist is private");
        }

        List<PlaylistVideo> videos = playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(playlistId);
        Map<String, Object> result = toPlaylistMap(playlist);

        List<Map<String, Object>> videosList = videos.stream().map(pv -> {
            Video v = pv.getVideo();
            return Map.<String, Object>of(
                    "id", v.getId().toString(),
                    "title", v.getTitle(),
                    "thumbnailUrl", v.getThumbnailUrl(),
                    "duration", v.getDuration(),
                    "views", v.getViews(),
                    "position", pv.getPosition(),
                    "addedAt", pv.getAddedAt().toString()
            );
        }).toList();

        return Map.of(
                "playlist", result,
                "videos", videosList,
                "totalVideos", videos.size()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getUserPlaylists(UUID userId, UUID currentUserId, int page, int limit) {
        Page<Playlist> playlistPage;
        boolean isOwner = currentUserId != null && currentUserId.equals(userId);

        if (isOwner) {
            playlistPage = playlistRepository.findByOwnerIdOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, limit));
        } else {
            playlistPage = playlistRepository.findByOwnerIdAndIsPublicTrueOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, limit));
        }

        List<Map<String, Object>> docs = playlistPage.getContent().stream()
                .map(this::toPlaylistMap)
                .toList();

        return PageResponse.of(docs, playlistPage.getTotalElements(), page, limit);
    }

    public Map<String, Object> updatePlaylist(UUID playlistId, UUID userId, String name, String description, Boolean isPublic) {
        Playlist playlist = findPlaylistById(playlistId);
        verifyOwnership(playlist, userId);

        if (name != null && !name.isBlank()) playlist.setName(name);
        if (description != null) playlist.setDescription(description);
        if (isPublic != null) playlist.setPublic(isPublic);

        playlist = playlistRepository.save(playlist);
        return toPlaylistMap(playlist);
    }

    public void deletePlaylist(UUID playlistId, UUID userId) {
        Playlist playlist = findPlaylistById(playlistId);
        verifyOwnership(playlist, userId);
        playlistRepository.delete(playlist);
    }

    public Map<String, Object> addVideo(UUID playlistId, UUID videoId, UUID userId) {
        Playlist playlist = findPlaylistById(playlistId);
        verifyOwnership(playlist, userId);

        if (playlistVideoRepository.existsByPlaylistIdAndVideoId(playlistId, videoId)) {
            throw ApiException.conflict("Video already in playlist");
        }

        Video video = videoService.findVideoById(videoId);
        int nextPos = playlistVideoRepository.findMaxPosition(playlistId) + 1;

        PlaylistVideo pv = new PlaylistVideo();
        pv.setPlaylist(playlist);
        pv.setVideo(video);
        pv.setPosition(nextPos);
        playlistVideoRepository.save(pv);

        return Map.of("message", "Video added to playlist", "position", nextPos);
    }

    public void removeVideo(UUID playlistId, UUID videoId, UUID userId) {
        Playlist playlist = findPlaylistById(playlistId);
        verifyOwnership(playlist, userId);
        playlistVideoRepository.deleteByPlaylistIdAndVideoId(playlistId, videoId);
    }

    private Playlist findPlaylistById(UUID playlistId) {
        return playlistRepository.findById(playlistId)
                .orElseThrow(() -> ApiException.notFound("Playlist"));
    }

    private void verifyOwnership(Playlist playlist, UUID userId) {
        if (!playlist.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("You are not authorized to modify this playlist");
        }
    }

    private Map<String, Object> toPlaylistMap(Playlist playlist) {
        long videoCount = playlistVideoRepository.countByPlaylistId(playlist.getId());
        User owner = playlist.getOwner();
        return Map.of(
                "id", playlist.getId().toString(),
                "name", playlist.getName(),
                "description", playlist.getDescription() != null ? playlist.getDescription() : "",
                "isPublic", playlist.isPublic(),
                "totalVideos", videoCount,
                "owner", Map.of(
                        "id", owner.getId().toString(),
                        "userName", owner.getUserName(),
                        "fullName", owner.getFullName(),
                        "avatarUrl", owner.getAvatarUrl() != null ? owner.getAvatarUrl() : ""
                ),
                "createdAt", playlist.getCreatedAt().toString(),
                "updatedAt", playlist.getUpdatedAt().toString()
        );
    }
}
