package com.streamify.modules.dashboard;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.dashboard.DashboardService;
import com.streamify.modules.video.VideoDtos.VideoListResponse;
import com.streamify.modules.video.VideoService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Channel dashboard analytics")
public class DashboardController {

    private final DashboardService dashboardService;
    private final VideoService videoService;

    public DashboardController(DashboardService dashboardService, VideoService videoService) {
        this.dashboardService = dashboardService;
        this.videoService = videoService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get channel statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChannelStats(
            @AuthenticationPrincipal UserPrincipal principal) {

        Map<String, Object> stats = dashboardService.getChannelStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/videos")
    @Operation(summary = "Get all channel videos (including unpublished)")
    public ResponseEntity<ApiResponse<PageResponse<VideoListResponse>>> getChannelVideos(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        PageResponse<VideoListResponse> videos = videoService
                .getVideosByOwner(principal.getId(), true, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(videos));
    }
}
