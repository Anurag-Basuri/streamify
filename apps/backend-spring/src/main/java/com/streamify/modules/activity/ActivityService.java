package com.streamify.modules.activity;

import com.streamify.common.ApiException;
import com.streamify.modules.activity.ActivityDtos.*;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get paginated activity log with optional type and date filters.
     */
    public PaginatedActivityResponse getActivityLog(UUID userId, int page, int limit,
                                                     String type, Instant startDate, Instant endDate) {
        PageRequest pageable = PageRequest.of(Math.max(0, page - 1), limit);
        Page<Activity> activityPage;

        if (type != null && !type.isBlank() && startDate != null && endDate != null) {
            activityPage = activityRepository.findByUserIdAndTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
                    userId, type, startDate, endDate, pageable);
        } else if (type != null && !type.isBlank()) {
            activityPage = activityRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
        } else if (startDate != null && endDate != null) {
            activityPage = activityRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    userId, startDate, endDate, pageable);
        } else {
            activityPage = activityRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        List<ActivityResponse> activities = activityPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        int totalPages = activityPage.getTotalPages();
        return new PaginatedActivityResponse(activities, new PaginationInfo(
                page, totalPages, activityPage.getTotalElements(),
                page < totalPages, page > 1
        ));
    }

    /**
     * Get activity summary/stats with type breakdown and daily chart data.
     */
    public ActivitySummaryResponse getActivitySummary(UUID userId, int days) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);

        List<Object[]> summaryRows = activityRepository.getActivitySummary(userId, since);
        List<TypeStat> summary = summaryRows.stream()
                .map(row -> new TypeStat(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        (Instant) row[2]
                ))
                .toList();

        List<Object[]> dailyRows = activityRepository.getDailyActivity(userId, since);
        List<DailyActivityStat> dailyActivity = dailyRows.stream()
                .map(row -> new DailyActivityStat(
                        row[0].toString(),
                        ((Number) row[1]).longValue()
                ))
                .toList();

        long totalCount = activityRepository.countByUserIdAndCreatedAtGreaterThanEqual(userId, since);

        return new ActivitySummaryResponse(summary, dailyActivity, totalCount, "Last " + days + " days");
    }

    /**
     * Get available activity types.
     */
    public List<ActivityTypeItem> getActivityTypes() {
        return List.of(
                new ActivityTypeItem("video_watch", "Video Watched", "play"),
                new ActivityTypeItem("video_upload", "Video Uploaded", "upload"),
                new ActivityTypeItem("video_like", "Video Liked", "heart"),
                new ActivityTypeItem("comment_add", "Comment Added", "message"),
                new ActivityTypeItem("comment_like", "Comment Liked", "heart"),
                new ActivityTypeItem("tweet_create", "Post Created", "edit"),
                new ActivityTypeItem("tweet_like", "Post Liked", "heart"),
                new ActivityTypeItem("subscription_add", "Subscribed", "user-plus"),
                new ActivityTypeItem("subscription_remove", "Unsubscribed", "user-minus"),
                new ActivityTypeItem("playlist_create", "Playlist Created", "list"),
                new ActivityTypeItem("watchlater_add", "Added to Watch Later", "clock")
        );
    }

    /**
     * Delete a specific activity by ID (ownership check).
     */
    @Transactional
    public void deleteActivity(UUID activityId, UUID userId) {
        Activity activity = activityRepository.findByIdAndUserId(activityId, userId)
                .orElseThrow(() -> ApiException.notFound("Activity not found or not authorized"));
        activityRepository.delete(activity);
    }

    /**
     * Clear all activity for a user, optionally filtered by type.
     */
    @Transactional
    public int clearActivityLog(UUID userId, String type) {
        if (type != null && !type.isBlank()) {
            return activityRepository.deleteAllByUserIdAndType(userId, type);
        }
        return activityRepository.deleteAllByUserId(userId);
    }

    /**
     * Log a new activity entry (called by ActivityEventListener).
     */
    @Transactional
    public void logActivity(UUID userId, String type, String entityType, UUID entityId,
                            Map<String, Object> metadata) {
        User user = userRepository.getReferenceById(userId);
        Activity activity = new Activity();
        activity.setUser(user);
        activity.setType(type);
        activity.setEntityType(entityType);
        activity.setEntityId(entityId);
        activity.setMetadata(metadata);
        activityRepository.save(activity);
    }

    private ActivityResponse toResponse(Activity a) {
        return new ActivityResponse(
                a.getId(),
                a.getType(),
                a.getEntityType(),
                a.getEntityId(),
                a.getMetadata(),
                a.getCreatedAt()
        );
    }
}
