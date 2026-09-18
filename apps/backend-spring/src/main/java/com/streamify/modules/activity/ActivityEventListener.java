package com.streamify.modules.activity;

import com.streamify.events.DomainEvents.ActivityLogEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listens for ActivityLogEvent and persists audit records asynchronously.
 */
@Component
public class ActivityEventListener {

    private static final Logger log = LoggerFactory.getLogger(ActivityEventListener.class);

    private final ActivityService activityService;

    public ActivityEventListener(ActivityService activityService) {
        this.activityService = activityService;
    }

    @Async
    @EventListener
    public void onActivityLog(ActivityLogEvent event) {
        try {
            activityService.logActivity(
                    event.userId(),
                    event.type(),
                    event.entityType(),
                    event.entityId(),
                    event.metadata()
            );
            log.debug("Logged activity: {} for user {}", event.type(), event.userId());
        } catch (Exception e) {
            log.error("Failed to log activity: {} for user {}: {}",
                    event.type(), event.userId(), e.getMessage());
        }
    }
}
