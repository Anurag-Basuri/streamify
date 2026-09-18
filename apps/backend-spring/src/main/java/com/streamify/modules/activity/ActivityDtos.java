package com.streamify.modules.activity;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Typed DTOs for the Activity module.
 */
public final class ActivityDtos {

    private ActivityDtos() {}

    public record ActivityResponse(
            UUID id,
            String type,
            String entityType,
            UUID entityId,
            Map<String, Object> metadata,
            Instant createdAt
    ) {}

    public record ActivitySummaryResponse(
            List<TypeStat> summary,
            List<DailyActivityStat> dailyActivity,
            long totalCount,
            String period
    ) {}

    public record TypeStat(
            String type,
            long count,
            Instant lastActivity
    ) {}

    public record DailyActivityStat(
            String date,
            long count
    ) {}

    public record ActivityTypeItem(
            String type,
            String label,
            String icon
    ) {}

    public record PaginatedActivityResponse(
            List<ActivityResponse> activities,
            PaginationInfo pagination
    ) {}

    public record PaginationInfo(
            int currentPage,
            int totalPages,
            long totalItems,
            boolean hasNext,
            boolean hasPrev
    ) {}
}
