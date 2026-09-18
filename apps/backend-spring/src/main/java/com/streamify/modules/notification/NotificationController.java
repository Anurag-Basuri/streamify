package com.streamify.modules.notification;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.notification.NotificationService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Notification management")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get notifications")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        PageResponse<Map<String, Object>> notifications = notificationService
                .getNotifications(principal.getId(), page, limit);
        return ResponseEntity.ok(ApiResponse.ok(notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {

        long count = notificationService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal UserPrincipal principal) {

        notificationService.markAsRead(notificationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Marked as read"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {

        int updated = notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("markedAsRead", updated)));
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal UserPrincipal principal) {

        notificationService.deleteNotification(notificationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification deleted"));
    }

    @DeleteMapping("/all")
    @Operation(summary = "Delete all notifications")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteAllNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {

        int deleted = notificationService.deleteAllNotifications(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deletedCount", deleted),
                "All notifications deleted"));
    }
}
