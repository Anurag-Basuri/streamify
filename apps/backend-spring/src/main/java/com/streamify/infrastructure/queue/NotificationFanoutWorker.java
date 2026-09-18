package com.streamify.infrastructure.queue;

import com.streamify.events.DomainEvents.VideoPublishedEvent;
import com.streamify.infrastructure.socket.SocketNotificationService;
import com.streamify.modules.notification.Notification;
import com.streamify.modules.notification.NotificationRepository;
import com.streamify.modules.subscription.SubscriptionRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Asynchronous consumer for VideoPublishedEvent.
 * Fans out notifications to all subscribers of the video uploader,
 * persists them in the database, and broadcasts real-time socket events.
 */
@Component
public class NotificationFanoutWorker {

    private static final Logger log = LoggerFactory.getLogger(NotificationFanoutWorker.class);

    private final SubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SocketNotificationService socketService;

    public NotificationFanoutWorker(
            SubscriptionRepository subscriptionRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SocketNotificationService socketService) {
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.socketService = socketService;
    }

    @Async
    @EventListener
    public void onVideoPublished(VideoPublishedEvent event) {
        log.info("Processing upload fanout for video {} by user {}", event.videoId(), event.uploaderId());

        User uploader = userRepository.findById(event.uploaderId()).orElse(null);
        if (uploader == null) {
            log.warn("Uploader {} not found — skipping fanout", event.uploaderId());
            return;
        }

        // Get all subscriber IDs for this channel
        List<UUID> subscriberIds = subscriptionRepository.findSubscriberIdsByChannelId(event.uploaderId());

        // Exclude the uploader themselves
        subscriberIds = subscriberIds.stream()
                .filter(id -> !id.equals(event.uploaderId()))
                .toList();

        if (subscriberIds.isEmpty()) {
            log.debug("No subscribers to notify for video {}", event.videoId());
            return;
        }

        String message = (uploader.getUserName() != null ? uploader.getUserName() : uploader.getFullName())
                + " uploaded a new video: \"" + event.title() + "\"";
        String link = "/watch/" + event.videoId();

        // Batch create notifications — use User entity references
        List<Notification> notifications = subscriberIds.stream().map(subscriberId -> {
            User recipientRef = userRepository.getReferenceById(subscriberId);
            Notification n = new Notification();
            n.setRecipient(recipientRef);
            n.setSender(uploader);
            n.setType("upload");
            n.setMessage(message);
            n.setLink(link);
            n.setEntityType("Video");
            n.setEntityId(event.videoId());
            n.setMetadata(Map.of(
                    "videoTitle", event.title(),
                    "videoThumbnail", event.thumbnail() != null ? event.thumbnail() : ""
            ));
            return n;
        }).toList();

        List<Notification> saved = notificationRepository.saveAll(notifications);
        log.info("Created {} upload notifications for video {}", saved.size(), event.videoId());

        // Broadcast real-time events
        for (Notification n : saved) {
            try {
                socketService.emit(n.getRecipient().getId(), Map.of(
                        "id", n.getId().toString(),
                        "type", n.getType(),
                        "message", n.getMessage(),
                        "link", n.getLink() != null ? n.getLink() : "",
                        "sender", Map.of(
                                "id", uploader.getId().toString(),
                                "userName", uploader.getUserName() != null ? uploader.getUserName() : "",
                                "fullName", uploader.getFullName(),
                                "avatar", uploader.getAvatarUrl() != null ? uploader.getAvatarUrl() : ""
                        ),
                        "createdAt", n.getCreatedAt().toString()
                ));
            } catch (Exception e) {
                log.debug("Failed to emit socket notification to {}: {}", n.getRecipient().getId(), e.getMessage());
            }
        }
    }
}
