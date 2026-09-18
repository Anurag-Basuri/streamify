package com.streamify.modules.watchlater;

import java.time.Instant;
import java.util.UUID;

/**
 * Typed DTOs for the Watch Later module.
 */
public final class WatchLaterDtos {

    private WatchLaterDtos() {}

    public record WatchLaterItemResponse(
            UUID id,
            UUID videoId,
            String title,
            String thumbnailUrl,
            double duration,
            long views,
            String ownerUserName,
            String ownerAvatar,
            Instant addedAt
    ) {}

    public record WatchLaterStatsResponse(
            long totalItems,
            double totalDurationMinutes
    ) {}
}
