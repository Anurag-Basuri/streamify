package com.streamify.modules.playlist;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Typed DTOs for the Playlist module.
 */
public final class PlaylistDtos {

    private PlaylistDtos() {}

    public record CreatePlaylistRequest(
            @NotBlank(message = "Playlist name is required")
            String name,
            String description,
            boolean isPublic
    ) {}

    public record UpdatePlaylistRequest(
            String name,
            String description,
            Boolean isPublic
    ) {}

    public record ReorderRequest(
            List<UUID> videoIds
    ) {}

    public record PlaylistResponse(
            UUID id,
            UUID ownerId,
            String ownerUserName,
            String ownerAvatar,
            String name,
            String description,
            boolean isPublic,
            int videoCount,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record PlaylistDetailResponse(
            UUID id,
            UUID ownerId,
            String ownerUserName,
            String ownerAvatar,
            String name,
            String description,
            boolean isPublic,
            List<PlaylistVideoItem> videos,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record PlaylistVideoItem(
            UUID videoId,
            String title,
            String thumbnailUrl,
            double duration,
            long views,
            String ownerUserName,
            int position,
            Instant addedAt
    ) {}
}
