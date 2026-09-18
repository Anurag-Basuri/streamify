package com.streamify.modules.video;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.video.VideoDtos.*;
import com.streamify.modules.video.VideoService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/videos")
@Tag(name = "Videos", description = "Video CRUD and feed operations")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Publish a new video")
    public ResponseEntity<ApiResponse<VideoResponse>> publishVideo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute PublishVideoRequest request,
            @RequestPart(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnailFile) {

        VideoResponse video = videoService.publishVideo(principal.getId(), request, videoFile, thumbnailFile);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(video, "Video published successfully"));
    }

    @GetMapping
    @Operation(summary = "Get published video feed")
    public ResponseEntity<ApiResponse<PageResponse<VideoListResponse>>> getFeed(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        PageResponse<VideoListResponse> feed = videoService.getPublishedFeed(page, limit);
        return ResponseEntity.ok(ApiResponse.ok(feed));
    }

    @GetMapping("/search")
    @Operation(summary = "Search videos")
    public ResponseEntity<ApiResponse<PageResponse<VideoListResponse>>> searchVideos(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        PageResponse<VideoListResponse> results = videoService.searchVideos(query, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/{videoId}")
    @Operation(summary = "Get video by ID")
    public ResponseEntity<ApiResponse<VideoResponse>> getVideoById(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        VideoResponse video = videoService.getVideoById(videoId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(video));
    }

    @PatchMapping(value = "/{videoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update video details")
    public ResponseEntity<ApiResponse<VideoResponse>> updateVideo(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute UpdateVideoRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnailFile) {

        VideoResponse video = videoService.updateVideo(videoId, principal.getId(), request, thumbnailFile);
        return ResponseEntity.ok(ApiResponse.ok(video, "Video updated successfully"));
    }

    @DeleteMapping("/{videoId}")
    @Operation(summary = "Delete a video (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {

        videoService.deleteVideo(videoId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Video deleted successfully"));
    }

    @PatchMapping("/{videoId}/toggle-publish")
    @Operation(summary = "Toggle video publish status")
    public ResponseEntity<ApiResponse<VideoResponse>> togglePublish(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {

        VideoResponse video = videoService.togglePublish(videoId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(video, "Publish status toggled"));
    }

    @PostMapping("/{videoId}/views")
    @Operation(summary = "Increment video view count")
    public ResponseEntity<ApiResponse<Void>> incrementViews(@PathVariable UUID videoId) {
        videoService.incrementViews(videoId);
        return ResponseEntity.ok(ApiResponse.ok(null, "View recorded"));
    }

    @GetMapping("/recommendations/{videoId}")
    @Operation(summary = "Get video recommendations")
    public ResponseEntity<ApiResponse<List<VideoListResponse>>> getRecommendations(
            @PathVariable UUID videoId,
            @RequestParam(defaultValue = "10") int limit) {

        List<VideoListResponse> recs = videoService.getRecommendations(videoId, limit);
        return ResponseEntity.ok(ApiResponse.ok(recs));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get videos by user")
    public ResponseEntity<ApiResponse<PageResponse<VideoListResponse>>> getUserVideos(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        boolean includeUnpublished = principal != null && principal.getId().equals(userId);
        PageResponse<VideoListResponse> videos = videoService.getVideosByOwner(userId, includeUnpublished, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(videos));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Publish a new video (Alias)")
    public ResponseEntity<ApiResponse<VideoResponse>> uploadVideoAlias(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute PublishVideoRequest request,
            @RequestPart(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnailFile) {
        return publishVideo(principal, request, videoFile, thumbnailFile);
    }

    @PatchMapping(value = "/update/{videoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update video details (Alias)")
    public ResponseEntity<ApiResponse<VideoResponse>> updateVideoAlias(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute UpdateVideoRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnailFile) {
        return updateVideo(videoId, principal, request, thumbnailFile);
    }

    @PatchMapping("/publish/{videoId}")
    @Operation(summary = "Toggle video publish status (Alias)")
    public ResponseEntity<ApiResponse<VideoResponse>> togglePublishAlias(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return togglePublish(videoId, principal);
    }
}
