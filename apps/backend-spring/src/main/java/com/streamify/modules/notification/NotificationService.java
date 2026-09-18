package com.streamify.modules.notification;

import com.streamify.common.PageResponse;
import com.streamify.modules.notification.Notification;
import com.streamify.modules.notification.NotificationRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    public void createNotification(UUID recipientId, UUID senderId, String type,
                                    String message, String link,
                                    String entityType, UUID entityId) {
        User recipient = userService.findUserById(recipientId);
        User sender = userService.findUserById(senderId);

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setType(type);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notificationRepository.save(notification);

        // TODO: Emit via WebSocket for real-time delivery
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getNotifications(UUID userId, int page, int limit) {
        Page<Notification> notifPage = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = notifPage.getContent().stream()
                .map(this::toNotificationMap)
                .toList();

        return PageResponse.of(docs, notifPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public int markAsRead(UUID notificationId, UUID userId) {
        return notificationRepository.markAsRead(notificationId, userId);
    }

    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    public int deleteNotification(UUID notificationId, UUID userId) {
        return notificationRepository.deleteByIdAndRecipientId(notificationId, userId);
    }

    public int deleteAllNotifications(UUID userId) {
        return notificationRepository.deleteAllByRecipientId(userId);
    }

    private Map<String, Object> toNotificationMap(Notification n) {
        User sender = n.getSender();
        return Map.of(
                "id", n.getId().toString(),
                "type", n.getType(),
                "message", n.getMessage(),
                "link", n.getLink() != null ? n.getLink() : "",
                "isRead", n.isRead(),
                "sender", Map.of(
                        "id", sender.getId().toString(),
                        "userName", sender.getUserName(),
                        "fullName", sender.getFullName(),
                        "avatarUrl", sender.getAvatarUrl() != null ? sender.getAvatarUrl() : ""
                ),
                "entityType", n.getEntityType() != null ? n.getEntityType() : "",
                "createdAt", n.getCreatedAt().toString()
        );
    }
}
