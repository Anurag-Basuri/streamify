package com.streamify.modules.watchlater;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.watchlater.WatchLaterService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/watch-later")
@Tag(name = "Watch Later", description = "Save videos for later viewing")
public class WatchLaterController {

    private final WatchLaterService watchLaterService;

    public WatchLaterController(WatchLaterService watchLaterService) {
        this.watchLaterService = watchLaterService;
    }

    @PostMapping("/{videoId}")
    @Operation(summary = "Toggle save for later")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWatchLater(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Map<String, Object> result = watchLaterService.toggleWatchLater(principal.getId(), videoId);
        boolean saved = (boolean) result.get("saved");
        String message = saved ? "Saved to watch later" : "Removed from watch later";
        return ResponseEntity.ok(ApiResponse.ok(result, message));
    }

    @GetMapping
    @Operation(summary = "Get watch later list")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getWatchLaterList(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        PageResponse<Map<String, Object>> list = watchLaterService.getWatchLaterList(principal.getId(), page, limit);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/toggle/{videoId}")
    @Operation(summary = "Toggle save for later (Alias)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWatchLaterAlias(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return toggleWatchLater(videoId, principal);
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear all watch later videos")
    public ResponseEntity<ApiResponse<Void>> clearWatchLater(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        watchLaterService.clearWatchLater(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Watch later list cleared"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get watch later stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Map<String, Object> stats = watchLaterService.getStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
