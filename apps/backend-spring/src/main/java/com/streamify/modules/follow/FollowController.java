package com.streamify.modules.follow;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.follow.FollowService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/follows")
@Tag(name = "Follows", description = "Social follow management")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{followeeId}")
    @Operation(summary = "Toggle follow on a user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFollow(
            @PathVariable UUID followeeId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Map<String, Object> result = followService.toggleFollow(principal.getId(), followeeId);
        boolean following = (boolean) result.get("following");
        String message = following ? "Followed successfully" : "Unfollowed successfully";
        return ResponseEntity.ok(ApiResponse.ok(result, message));
    }

    @GetMapping("/{userId}/followers")
    @Operation(summary = "Get followers of a user")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getFollowers(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        PageResponse<Map<String, Object>> followers = followService.getFollowers(userId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(followers));
    }

    @GetMapping("/{userId}/following")
    @Operation(summary = "Get users that a user follows")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getFollowing(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        PageResponse<Map<String, Object>> following = followService.getFollowing(userId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(following));
    }

    @PostMapping("/toggle/{followeeId}")
    @Operation(summary = "Toggle follow on a user (Alias)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFollowAlias(
            @PathVariable UUID followeeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return toggleFollow(followeeId, principal);
    }

    @GetMapping("/check/{followeeId}")
    @Operation(summary = "Check if current user follows another user")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFollow(
            @PathVariable UUID followeeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        boolean isFollowing = followService.isFollowing(principal.getId(), followeeId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("isFollowing", isFollowing)));
    }

    @GetMapping("/followers")
    @Operation(summary = "Get current user's followers (Alias)")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getMyFollowers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return getFollowers(principal.getId(), page, limit);
    }

    @GetMapping("/following")
    @Operation(summary = "Get users that current user follows (Alias)")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getMyFollowing(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return getFollowing(principal.getId(), page, limit);
    }
}
