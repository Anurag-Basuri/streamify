package com.streamify.modules.activity;

import com.streamify.common.ApiResponse;
import com.streamify.modules.activity.ActivityDtos.*;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activity")
@Tag(name = "Activity", description = "User activity log and analytics")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @Operation(summary = "Get activity log with pagination and filters")
    public ResponseEntity<ApiResponse<PaginatedActivityResponse>> getActivityLog(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate) {

        PaginatedActivityResponse response = activityService.getActivityLog(
                principal.getId(), page, limit, type, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(response, "Activity log retrieved successfully"));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get activity summary/stats for dashboard")
    public ResponseEntity<ApiResponse<ActivitySummaryResponse>> getActivitySummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "7") int days) {

        ActivitySummaryResponse summary = activityService.getActivitySummary(principal.getId(), days);
        return ResponseEntity.ok(ApiResponse.ok(summary, "Activity summary retrieved successfully"));
    }

    @GetMapping("/types")
    @Operation(summary = "Get available activity types")
    public ResponseEntity<ApiResponse<List<ActivityTypeItem>>> getActivityTypes() {
        List<ActivityTypeItem> types = activityService.getActivityTypes();
        return ResponseEntity.ok(ApiResponse.ok(types, "Activity types retrieved successfully"));
    }

    @DeleteMapping("/{activityId}")
    @Operation(summary = "Delete specific activity")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(
            @PathVariable UUID activityId,
            @AuthenticationPrincipal UserPrincipal principal) {

        activityService.deleteActivity(activityId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Activity deleted successfully"));
    }

    @DeleteMapping
    @Operation(summary = "Clear activity log (optionally by type)")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> clearActivityLog(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String type) {

        int deletedCount = activityService.clearActivityLog(principal.getId(), type);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deletedCount", deletedCount),
                "Activity log cleared successfully"));
    }
}
