package com.streamify.modules.like;

import java.time.Instant;
import java.util.UUID;

/**
 * Typed DTOs for the Like module.
 */
public final class LikeDtos {

    private LikeDtos() {}

    public record LikeToggleResponse(
            boolean liked,
            long totalLikes
    ) {}

    public record LikedVideoResponse(
            UUID videoId,
            String title,
            String thumbnailUrl,
            double duration,
            long views,
            String ownerUserName,
            String ownerAvatar,
            Instant likedAt
    ) {}

    public record LikedTweetResponse(
            UUID tweetId,
            String content,
            String ownerUserName,
            String ownerAvatar,
            Instant likedAt
    ) {}

    public record LikedCommentResponse(
            UUID commentId,
            String content,
            String ownerUserName,
            Instant likedAt
    ) {}
}
