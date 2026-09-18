package com.streamify.modules.tweet;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.tweet.TweetService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tweets")
@Tag(name = "Tweets", description = "Community post operations")
public class TweetController {

    private final TweetService tweetService;

    public TweetController(TweetService tweetService) {
        this.tweetService = tweetService;
    }

    @PostMapping
    @Operation(summary = "Create a tweet")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTweet(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {

        Map<String, Object> tweet = tweetService.createTweet(principal.getId(), body.get("content"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(tweet, "Tweet created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get tweet feed")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getFeed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<Map<String, Object>> feed = tweetService.getFeed(currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(feed));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get tweets by user")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getUserTweets(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<Map<String, Object>> tweets = tweetService.getUserTweets(userId, currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(tweets));
    }

    @PatchMapping("/{tweetId}")
    @Operation(summary = "Update a tweet")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTweet(
            @PathVariable UUID tweetId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {

        Map<String, Object> tweet = tweetService.updateTweet(tweetId, principal.getId(), body.get("content"));
        return ResponseEntity.ok(ApiResponse.ok(tweet, "Tweet updated successfully"));
    }

    @DeleteMapping("/{tweetId}")
    @Operation(summary = "Delete a tweet")
    public ResponseEntity<ApiResponse<Void>> deleteTweet(
            @PathVariable UUID tweetId,
            @AuthenticationPrincipal UserPrincipal principal) {

        tweetService.deleteTweet(tweetId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Tweet deleted successfully"));
    }

    @PostMapping("/create")
    @Operation(summary = "Create a tweet (Alias)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTweetAlias(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {
        return createTweet(principal, body);
    }

    @GetMapping("/feed")
    @Operation(summary = "Get tweet feed (Alias)")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getFeedAlias(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return getFeed(principal, page, limit);
    }
}
