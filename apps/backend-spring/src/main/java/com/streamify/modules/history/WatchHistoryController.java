package com.streamify.modules.history;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.history.WatchHistoryService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/history")
@Tag(name = "History", description = "Watch history management")
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;

    public WatchHistoryController(WatchHistoryService watchHistoryService) {
        this.watchHistoryService = watchHistoryService;
    }

    @PostMapping("/{videoId}")
    @Operation(summary = "Add or update watch history entry")
    public ResponseEntity<ApiResponse<Void>> addToHistory(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Double> body) {

        double playbackTimestamp = body.getOrDefault("playbackTimestamp", 0.0);
        double videoDuration = body.getOrDefault("videoDuration", 0.0);
        watchHistoryService.addToHistory(principal.getId(), videoId, playbackTimestamp, videoDuration);
        return ResponseEntity.ok(ApiResponse.ok(null, "History updated"));
    }

    @GetMapping
    @Operation(summary = "Get watch history")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        PageResponse<Map<String, Object>> history = watchHistoryService.getHistory(principal.getId(), page, limit);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @DeleteMapping
    @Operation(summary = "Clear all watch history")
    public ResponseEntity<ApiResponse<Void>> clearHistory(
            @AuthenticationPrincipal UserPrincipal principal) {

        watchHistoryService.clearHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "History cleared"));
    }

    @PostMapping("/add/{videoId}")
    @Operation(summary = "Add or update watch history entry (Alias)")
    public ResponseEntity<ApiResponse<Void>> addToHistoryAlias(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Double> body) {
        return addToHistory(videoId, principal, body);
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear all watch history (Alias)")
    public ResponseEntity<ApiResponse<Void>> clearHistoryAlias(
            @AuthenticationPrincipal UserPrincipal principal) {
        return clearHistory(principal);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get watch history stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Map<String, Object> stats = watchHistoryService.getStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping("/batch")
    @Operation(summary = "Batch add watch history (Stub)")
    public ResponseEntity<ApiResponse<Void>> batchAddHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody java.util.List<Map<String, Object>> body) {
        // Simple stub: could iterate and call addToHistory. For now, return OK.
        return ResponseEntity.ok(ApiResponse.ok(null, "Batch processed"));
    }
}
