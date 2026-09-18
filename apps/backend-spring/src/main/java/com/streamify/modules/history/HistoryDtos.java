package com.streamify.modules.history;

import java.time.Instant;
import java.util.UUID;

/**
 * Typed DTOs for the Watch History module.
 */
public final class HistoryDtos {

    private HistoryDtos() {}

    public record AddHistoryRequest(
            double playbackTimestamp,
            double videoDuration
    ) {}

    public record HistoryItemResponse(
            UUID id,
            UUID videoId,
            String title,
            String thumbnailUrl,
            double duration,
            long views,
            String ownerUserName,
            String ownerAvatar,
            double playbackTimestamp,
            double videoDuration,
            Instant watchedAt
    ) {}

    public record HistoryStatsResponse(
            long totalWatched,
            double totalWatchTimeMinutes
    ) {}

    public record BatchRemoveRequest(
            java.util.List<UUID> videoIds
    ) {}
}
