package com.streamify.modules.subscription;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.subscription.SubscriptionService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@Tag(name = "Subscriptions", description = "Channel subscription management")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/{channelId}")
    @Operation(summary = "Toggle subscription to a channel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleSubscription(
            @PathVariable UUID channelId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Map<String, Object> result = subscriptionService.toggleSubscription(principal.getId(), channelId);
        boolean subscribed = (boolean) result.get("subscribed");
        String message = subscribed ? "Subscribed successfully" : "Unsubscribed successfully";
        return ResponseEntity.ok(ApiResponse.ok(result, message));
    }

    @GetMapping("/{channelId}/subscribers")
    @Operation(summary = "Get subscribers of a channel")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getSubscribers(
            @PathVariable UUID channelId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        PageResponse<Map<String, Object>> subs = subscriptionService.getSubscribers(channelId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(subs));
    }

    @GetMapping("/me")
    @Operation(summary = "Get channels current user is subscribed to")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getMySubscriptions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        PageResponse<Map<String, Object>> channels = subscriptionService
                .getSubscribedChannels(principal.getId(), page, limit);
        return ResponseEntity.ok(ApiResponse.ok(channels));
    }

    @PostMapping("/toggle/{channelId}")
    @Operation(summary = "Toggle subscription to a channel (Alias)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleSubscriptionAlias(
            @PathVariable UUID channelId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return toggleSubscription(channelId, principal);
    }

    @GetMapping("/subscribed-channels")
    @Operation(summary = "Get channels current user is subscribed to (Alias)")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getSubscribedChannelsAlias(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return getMySubscriptions(principal, page, limit);
    }

    @GetMapping("/check/{channelId}")
    @Operation(summary = "Check if current user is subscribed to a channel")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkSubscription(
            @PathVariable UUID channelId,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isSubscribed = subscriptionService.isSubscribed(principal.getId(), channelId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("isSubscribed", isSubscribed)));
    }
}
