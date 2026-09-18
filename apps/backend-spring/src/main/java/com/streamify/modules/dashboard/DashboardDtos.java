package com.streamify.modules.dashboard;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Typed DTOs for the Dashboard module.
 */
public final class DashboardDtos {

    private DashboardDtos() {}

    public record ChannelStatsResponse(
            long totalVideos,
            long totalViews,
            long totalSubscribers,
            long totalSubscriptions,
            long totalLikes,
            long totalComments
    ) {}

    public record ChannelAnalyticsResponse(
            ChannelStatsResponse stats,
            List<DailyViewStat> viewsPerDay,
            List<TopVideoStat> topVideos,
            String period
    ) {}

    public record DailyViewStat(
            String date,
            long views
    ) {}

    public record TopVideoStat(
            UUID videoId,
            String title,
            String thumbnailUrl,
            long views,
            long likes,
            long comments,
            Instant publishedAt
    ) {}
}
