package com.streamify.infrastructure.socket;

import com.corundumstudio.socketio.SocketIOServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Emits real-time notification events to targeted user rooms via Socket.IO.
 */
@Service
public class SocketNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SocketNotificationService.class);

    private final SocketIOServer server;

    public SocketNotificationService(SocketIOServer server) {
        this.server = server;
    }

    /**
     * Send a notification:new event to a specific user's room.
     *
     * @param recipientId the user UUID to notify
     * @param payload     the notification data (serialized as JSON)
     */
    public void emit(UUID recipientId, Map<String, Object> payload) {
        String room = "user:" + recipientId;
        server.getRoomOperations(room).sendEvent("notification:new", payload);
        log.debug("Emitted notification:new to room {}", room);
    }

    /**
     * Send a notification:new event to a specific user's room.
     *
     * @param recipientId the user UUID to notify
     * @param payload     the notification data object
     */
    public void emit(UUID recipientId, Object payload) {
        String room = "user:" + recipientId;
        server.getRoomOperations(room).sendEvent("notification:new", payload);
        log.debug("Emitted notification:new to room {}", room);
    }
}
