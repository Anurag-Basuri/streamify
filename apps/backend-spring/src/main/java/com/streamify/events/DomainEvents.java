package com.streamify.events;

import java.util.Map;
import java.util.UUID;

/**
 * Domain events for decoupled cross-module interactions.
 * Published via Spring's {@link org.springframework.context.ApplicationEventPublisher}
 * and consumed by {@code @EventListener} / {@code @Async} listeners.
 */
public final class DomainEvents {

    private DomainEvents() {}

    /**
     * Fired when a video is published (or toggled to published state).
     * Triggers notification fanout to all subscribers of the uploader.
     */
    public record VideoPublishedEvent(
            UUID videoId,
            UUID uploaderId,
            String title,
            String thumbnail
    ) {}

    /**
     * Fired to log a user activity asynchronously.
     * Consumed by {@code ActivityEventListener} to persist audit records.
     */
    public record ActivityLogEvent(
            UUID userId,
            String type,
            String entityType,
            UUID entityId,
            Map<String, Object> metadata
    ) {}

    /**
     * Fired to create and deliver a notification to a specific user.
     */
    public record NotificationEvent(
            UUID recipientId,
            UUID senderId,
            String type,
            String message,
            String link,
            String entityType,
            UUID entityId,
            Map<String, Object> metadata
    ) {}
}
