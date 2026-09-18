package com.streamify.infrastructure.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.Transport;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Netty-SocketIO server configuration and lifecycle management.
 * Matches the frontend socket.io-client protocol events:
 * - user:join  → joins room "user:{userId}"
 * - user:leave → leaves room "user:{userId}"
 */
@Configuration
public class SocketIOServerRunner {

    private static final Logger log = LoggerFactory.getLogger(SocketIOServerRunner.class);

    @Value("${app.socketio.host:0.0.0.0}")
    private String host;

    @Value("${app.socketio.port:8085}")
    private int port;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(port);
        config.setOrigin(allowedOrigins);
        config.setTransports(Transport.WEBSOCKET, Transport.POLLING);

        // Disable unnecessary features for notifications-only server
        config.setPingInterval(25_000);
        config.setPingTimeout(60_000);

        server = new SocketIOServer(config);

        // Client joins their personal notification room
        server.addEventListener("user:join", String.class, (client, userId, ackRequest) -> {
            if (userId != null && !userId.isBlank()) {
                client.joinRoom("user:" + userId);
                log.debug("Client {} joined room user:{}", client.getSessionId(), userId);
            }
        });

        // Client leaves their personal notification room
        server.addEventListener("user:leave", String.class, (client, userId, ackRequest) -> {
            if (userId != null && !userId.isBlank()) {
                client.leaveRoom("user:" + userId);
                log.debug("Client {} left room user:{}", client.getSessionId(), userId);
            }
        });

        return server;
    }

    @PostConstruct
    public void startServer() {
        if (server != null) {
            server.start();
            log.info("✅ Socket.IO server started on {}:{}", host, port);
        }
    }

    @PreDestroy
    public void stopServer() {
        if (server != null) {
            server.stop();
            log.info("Socket.IO server stopped");
        }
    }
}
