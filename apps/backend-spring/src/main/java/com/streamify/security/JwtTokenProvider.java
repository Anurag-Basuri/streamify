package com.streamify.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * JWT provider for access and refresh tokens.
 * Uses HMAC-SHA256 signing matching the existing Node.js JWT implementation.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessTokenExpiryMs;
    private final long refreshTokenExpiryMs;

    public JwtTokenProvider(
            @Value("${app.jwt.access-token-secret}") String accessSecret,
            @Value("${app.jwt.refresh-token-secret}") String refreshSecret,
            @Value("${app.jwt.access-token-expiry-ms}") long accessTokenExpiryMs,
            @Value("${app.jwt.refresh-token-expiry-ms}") long refreshTokenExpiryMs) {
        this.accessKey = Keys.hmacShaKeyFor(padKey(accessSecret));
        this.refreshKey = Keys.hmacShaKeyFor(padKey(refreshSecret));
        this.accessTokenExpiryMs = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    /**
     * Generate an access token containing user claims.
     */
    public String generateAccessToken(UUID userId, String email, String userName, String fullName) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of(
                        "email", email,
                        "userName", userName,
                        "fullName", fullName
                ))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(accessKey)
                .compact();
    }

    /**
     * Generate a refresh token containing only the user ID.
     */
    public String generateRefreshToken(UUID userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiryMs);

        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(refreshKey)
                .compact();
    }

    /**
     * Parse and validate an access token, returning the claims.
     */
    public Claims parseAccessToken(String token) {
        return parseToken(token, accessKey);
    }

    /**
     * Parse and validate a refresh token, returning the claims.
     */
    public Claims parseRefreshToken(String token) {
        return parseToken(token, refreshKey);
    }

    /**
     * Extract user ID (UUID) from a token's subject claim.
     */
    public UUID getUserIdFromToken(String token, boolean isRefresh) {
        Claims claims = isRefresh ? parseRefreshToken(token) : parseAccessToken(token);
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Validate a token without extracting claims. Returns true if valid.
     */
    public boolean validateAccessToken(String token) {
        try {
            parseAccessToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid access token: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            parseRefreshToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    // ---- Internal ----

    private Claims parseToken(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Ensure the secret is at least 32 bytes for HMAC-SHA256.
     */
    private byte[] padKey(String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 32) return raw;
        byte[] padded = new byte[32];
        System.arraycopy(raw, 0, padded, 0, raw.length);
        return padded;
    }
}
