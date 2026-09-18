package com.streamify.modules.notification;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Typed DTOs for the Notification module.
 */
public final class NotificationDtos {

    private NotificationDtos() {}

    public record NotificationResponse(
            UUID id,
            String type,
            String message,
            String link,
            boolean isRead,
            String entityType,
            UUID entityId,
            Map<String, Object> metadata,
            SenderSummary sender,
            Instant createdAt
    ) {}

    public record SenderSummary(
            UUID id,
            String userName,
            String fullName,
            String avatar
    ) {}

    public record UnreadCountResponse(
            long unreadCount
    ) {}
}
