package com.streamify.modules.follow;

import java.time.Instant;
import java.util.UUID;

/**
 * Typed DTOs for the Follow module.
 */
public final class FollowDtos {

    private FollowDtos() {}

    public record FollowToggleResponse(
            boolean following,
            long followersCount
    ) {}

    public record FollowCheckResponse(
            boolean isFollowing
    ) {}

    public record FollowUserResponse(
            UUID id,
            String userName,
            String fullName,
            String avatar,
            Instant followedAt
    ) {}
}
