package com.streamify.modules.tweet;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

/**
 * Typed DTOs for the Tweet module.
 */
public final class TweetDtos {

    private TweetDtos() {}

    public record CreateTweetRequest(
            @NotBlank(message = "Content is required")
            String content
    ) {}

    public record UpdateTweetRequest(
            @NotBlank(message = "Content is required")
            String content
    ) {}

    public record TweetResponse(
            UUID id,
            UUID ownerId,
            String ownerUserName,
            String ownerFullName,
            String ownerAvatar,
            String content,
            long likesCount,
            long commentsCount,
            boolean isLiked,
            boolean isOwner,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
