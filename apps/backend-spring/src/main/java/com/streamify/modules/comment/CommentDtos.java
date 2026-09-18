package com.streamify.modules.comment;

import jakarta.validation.constraints.NotBlank;

public final class CommentDtos {

    private CommentDtos() {}

    public record CreateCommentRequest(
            @NotBlank(message = "Comment content is required")
            String content,

            String parentId  // null for top-level comments
    ) {}

    public record UpdateCommentRequest(
            @NotBlank(message = "Comment content is required")
            String content
    ) {}

    public record CommentResponse(
            String id,
            String content,
            OwnerInfo owner,
            String entityType,
            String entityId,
            String parentId,
            boolean isPinned,
            int replyCount,
            long likesCount,
            boolean isLiked,
            boolean isHearted,
            String createdAt,
            String updatedAt
    ) {}

    public record OwnerInfo(
            String id,
            String userName,
            String fullName,
            String avatarUrl
    ) {}
}
