package com.streamify.modules.like;

import com.streamify.common.ApiResponse;
import com.streamify.modules.like.LikeService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/likes")
@Tag(name = "Likes", description = "Toggle likes on videos, tweets, and comments")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{entityType}/{entityId}")
    @Operation(summary = "Toggle like on an entity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            @AuthenticationPrincipal UserPrincipal principal) {

        String normalizedType = capitalize(entityType);
        Map<String, Object> result = likeService.toggleLike(principal.getId(), normalizedType, entityId);

        boolean liked = (boolean) result.get("liked");
        String message = liked ? "Liked successfully" : "Unliked successfully";
        return ResponseEntity.ok(ApiResponse.ok(result, message));
    }

    @GetMapping("/{entityType}/{entityId}/status")
    @Operation(summary = "Check if current user liked an entity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLikeStatus(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            @AuthenticationPrincipal UserPrincipal principal) {

        String normalizedType = capitalize(entityType);
        boolean isLiked = likeService.isLiked(principal.getId(), normalizedType, entityId);
        long count = likeService.getLikesCount(normalizedType, entityId);

        return ResponseEntity.ok(ApiResponse.ok(Map.of("isLiked", isLiked, "likesCount", count)));
    }

    @PostMapping("/toggle/v/{videoId}")
    @Operation(summary = "Toggle like on a video")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleVideoLike(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return toggleLike("Video", videoId, principal);
    }

    @PostMapping("/toggle/c/{commentId}")
    @Operation(summary = "Toggle like on a comment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleCommentLike(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return toggleLike("Comment", commentId, principal);
    }

    @PostMapping("/toggle/t/{tweetId}")
    @Operation(summary = "Toggle like on a tweet")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleTweetLike(
            @PathVariable UUID tweetId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return toggleLike("Tweet", tweetId, principal);
    }

    @GetMapping("/videos")
    @Operation(summary = "Get all liked videos for current user")
    public ResponseEntity<ApiResponse<com.streamify.common.PageResponse<com.streamify.modules.like.LikeDtos.LikedVideoResponse>>> getLikedVideos(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        com.streamify.common.PageResponse<com.streamify.modules.like.LikeDtos.LikedVideoResponse> videos = 
                likeService.getLikedVideos(principal.getId(), page, limit);
        return ResponseEntity.ok(ApiResponse.ok(videos));
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }
}
