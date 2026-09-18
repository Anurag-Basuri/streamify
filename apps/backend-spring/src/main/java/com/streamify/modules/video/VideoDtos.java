package com.streamify.modules.video;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class VideoDtos {

    private VideoDtos() {}

    public record PublishVideoRequest(
            @NotBlank(message = "Title is required")
            @Size(max = 200, message = "Title cannot exceed 200 characters")
            String title,

            @NotBlank(message = "Description is required")
            String description,

            String videoUrl,
            String videoPublicId,
            String thumbnailUrl,
            String thumbnailPublicId,
            double duration,
            List<String> tags,
            Boolean isPublished
    ) {}

    public record UpdateVideoRequest(
            @Size(max = 200, message = "Title cannot exceed 200 characters")
            String title,

            String description,
            String thumbnailUrl,
            String thumbnailPublicId,
            List<String> tags,
            Boolean isPublished
    ) {}

    public record VideoResponse(
            String id,
            String title,
            String description,
            String videoUrl,
            String thumbnailUrl,
            double duration,
            long views,
            boolean isPublished,
            String slug,
            List<String> tags,
            OwnerResponse owner,
            long likesCount,
            boolean isLiked,
            long commentsCount,
            String createdAt,
            String updatedAt
    ) {}

    public record OwnerResponse(
            String id,
            String userName,
            String fullName,
            String avatarUrl
    ) {}

    public record VideoListResponse(
            String id,
            String title,
            String thumbnailUrl,
            double duration,
            long views,
            OwnerResponse owner,
            String createdAt
    ) {}
}
