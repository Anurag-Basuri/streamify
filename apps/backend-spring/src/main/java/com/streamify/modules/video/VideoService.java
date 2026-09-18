package com.streamify.modules.video;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.like.LikeRepository;
import com.streamify.modules.comment.CommentRepository;
import com.streamify.infrastructure.media.CloudinaryService;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import com.streamify.modules.video.VideoDtos.*;
import com.streamify.modules.video.Video;
import com.streamify.modules.video.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
@Transactional
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);

    private final VideoRepository videoRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final CloudinaryService cloudinaryService;
    private final UserService userService;

    public VideoService(VideoRepository videoRepository,
                        LikeRepository likeRepository,
                        CommentRepository commentRepository,
                        CloudinaryService cloudinaryService,
                        UserService userService) {
        this.videoRepository = videoRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.cloudinaryService = cloudinaryService;
        this.userService = userService;
    }

    // ---- Publish Video ----

    public VideoResponse publishVideo(UUID ownerId, PublishVideoRequest req,
                                       MultipartFile videoFile, MultipartFile thumbnailFile) {
        User owner = userService.findUserById(ownerId);

        String videoUrl = req.videoUrl();
        String videoPublicId = req.videoPublicId();
        String thumbnailUrl = req.thumbnailUrl();
        String thumbnailPublicId = req.thumbnailPublicId();

        // Upload video if file provided
        if (videoFile != null && !videoFile.isEmpty()) {
            var result = cloudinaryService.uploadVideo(videoFile, "streamify/videos");
            videoUrl = result.get("url");
            videoPublicId = result.get("publicId");
        }
        if (videoUrl == null || videoUrl.isBlank()) {
            throw ApiException.badRequest("Video file or URL is required");
        }

        // Upload thumbnail if file provided
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            var result = cloudinaryService.uploadImage(thumbnailFile, "streamify/thumbnails");
            thumbnailUrl = result.get("url");
            thumbnailPublicId = result.get("publicId");
        }
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
            throw ApiException.badRequest("Thumbnail file or URL is required");
        }

        Video video = new Video();
        video.setOwner(owner);
        video.setTitle(req.title());
        video.setDescription(req.description());
        video.setVideoUrl(videoUrl);
        video.setVideoPublicId(videoPublicId);
        video.setThumbnailUrl(thumbnailUrl);
        video.setThumbnailPublicId(thumbnailPublicId);
        video.setDuration(req.duration());
        video.setSlug(generateSlug(req.title()));
        video.setPublished(req.isPublished() != null ? req.isPublished() : true);

        if (req.tags() != null) {
            video.setTags(req.tags().toArray(new String[0]));
        }

        video = videoRepository.save(video);
        log.info("Video published: {} by {}", video.getId(), owner.getUserName());

        return toVideoResponse(video, null);
    }

    // ---- Get Video by ID ----

    @Transactional(readOnly = true)
    public VideoResponse getVideoById(UUID videoId, UUID currentUserId) {
        Video video = findVideoById(videoId);

        if (!video.isPublished() && (currentUserId == null || !video.getOwner().getId().equals(currentUserId))) {
            throw ApiException.notFound("Video");
        }

        return toVideoResponse(video, currentUserId);
    }

    // ---- Get Published Feed ----

    @Transactional(readOnly = true)
    public PageResponse<VideoListResponse> getPublishedFeed(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Video> videoPage = videoRepository.findPublishedVideos(pageable);

        List<VideoListResponse> docs = videoPage.getContent().stream()
                .map(this::toVideoListResponse)
                .toList();

        return PageResponse.of(docs, videoPage.getTotalElements(), page, limit);
    }

    // ---- Search ----

    @Transactional(readOnly = true)
    public PageResponse<VideoListResponse> searchVideos(String query, int page, int limit) {
        if (query == null || query.isBlank()) {
            return PageResponse.of(List.of(), 0, page, limit);
        }

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Video> videoPage = videoRepository.searchPublished(query, pageable);

        List<VideoListResponse> docs = videoPage.getContent().stream()
                .map(this::toVideoListResponse)
                .toList();

        return PageResponse.of(docs, videoPage.getTotalElements(), page, limit);
    }

    // ---- Videos by Owner ----

    @Transactional(readOnly = true)
    public PageResponse<VideoListResponse> getVideosByOwner(UUID ownerId, boolean includeUnpublished, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Video> videoPage;

        if (includeUnpublished) {
            videoPage = videoRepository.findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(ownerId, pageable);
        } else {
            videoPage = videoRepository.findByOwnerIdAndPublishedTrueAndDeletedFalseOrderByCreatedAtDesc(ownerId, pageable);
        }

        List<VideoListResponse> docs = videoPage.getContent().stream()
                .map(this::toVideoListResponse)
                .toList();

        return PageResponse.of(docs, videoPage.getTotalElements(), page, limit);
    }

    // ---- Update Video ----

    public VideoResponse updateVideo(UUID videoId, UUID ownerId, UpdateVideoRequest req,
                                      MultipartFile thumbnailFile) {
        Video video = findVideoById(videoId);
        verifyOwnership(video, ownerId);

        if (req.title() != null && !req.title().isBlank()) {
            video.setTitle(req.title());
        }
        if (req.description() != null) {
            video.setDescription(req.description());
        }
        if (req.tags() != null) {
            video.setTags(req.tags().toArray(new String[0]));
        }
        if (req.isPublished() != null) {
            video.setPublished(req.isPublished());
        }

        // Update thumbnail if new file provided
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            cloudinaryService.deleteImage(video.getThumbnailPublicId());
            var result = cloudinaryService.uploadImage(thumbnailFile, "streamify/thumbnails");
            video.setThumbnailUrl(result.get("url"));
            video.setThumbnailPublicId(result.get("publicId"));
        } else if (req.thumbnailUrl() != null) {
            video.setThumbnailUrl(req.thumbnailUrl());
            if (req.thumbnailPublicId() != null) {
                video.setThumbnailPublicId(req.thumbnailPublicId());
            }
        }

        video = videoRepository.save(video);
        return toVideoResponse(video, ownerId);
    }

    // ---- Delete Video (soft) ----

    public void deleteVideo(UUID videoId, UUID ownerId) {
        int updated = videoRepository.softDelete(videoId, ownerId);
        if (updated == 0) {
            throw ApiException.notFound("Video");
        }
    }

    // ---- Toggle Publish ----

    public VideoResponse togglePublish(UUID videoId, UUID ownerId) {
        Video video = findVideoById(videoId);
        verifyOwnership(video, ownerId);
        video.setPublished(!video.isPublished());
        video = videoRepository.save(video);
        return toVideoResponse(video, ownerId);
    }

    // ---- Increment Views ----

    public void incrementViews(UUID videoId) {
        videoRepository.incrementViews(videoId);
    }

    // ---- Recommendations ----

    @Transactional(readOnly = true)
    public List<VideoListResponse> getRecommendations(UUID videoId, int limit) {
        Video video = findVideoById(videoId);
        List<Video> recs = videoRepository.findRecommendations(
                videoId, video.getOwner().getId(), video.getTags(), limit);
        return recs.stream().map(this::toVideoListResponse).toList();
    }

    // ---- Helpers ----

    public Video findVideoById(UUID videoId) {
        return videoRepository.findById(videoId)
                .filter(v -> !v.isDeleted())
                .orElseThrow(() -> ApiException.notFound("Video"));
    }

    private void verifyOwnership(Video video, UUID ownerId) {
        if (!video.getOwner().getId().equals(ownerId)) {
            throw ApiException.forbidden("You are not authorized to modify this video");
        }
    }

    private VideoResponse toVideoResponse(Video video, UUID currentUserId) {
        long likesCount = likeRepository.countByEntityTypeAndEntityId("Video", video.getId());
        boolean isLiked = currentUserId != null &&
                likeRepository.existsByLikedByIdAndEntityTypeAndEntityId(currentUserId, "Video", video.getId());
        long commentsCount = commentRepository.countByEntityTypeAndEntityIdAndParentIsNull("Video", video.getId());

        User owner = video.getOwner();
        OwnerResponse ownerResp = new OwnerResponse(
                owner.getId().toString(), owner.getUserName(), owner.getFullName(), owner.getAvatarUrl());

        return new VideoResponse(
                video.getId().toString(),
                video.getTitle(),
                video.getDescription(),
                video.getVideoUrl(),
                video.getThumbnailUrl(),
                video.getDuration(),
                video.getViews(),
                video.isPublished(),
                video.getSlug(),
                video.getTags() != null ? List.of(video.getTags()) : List.of(),
                ownerResp,
                likesCount,
                isLiked,
                commentsCount,
                video.getCreatedAt().toString(),
                video.getUpdatedAt().toString()
        );
    }

    private VideoListResponse toVideoListResponse(Video video) {
        User owner = video.getOwner();
        OwnerResponse ownerResp = new OwnerResponse(
                owner.getId().toString(), owner.getUserName(), owner.getFullName(), owner.getAvatarUrl());

        return new VideoListResponse(
                video.getId().toString(),
                video.getTitle(),
                video.getThumbnailUrl(),
                video.getDuration(),
                video.getViews(),
                ownerResp,
                video.getCreatedAt().toString()
        );
    }

    private String generateSlug(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\p{ASCII}]").matcher(normalized).replaceAll("");
        slug = slug.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").trim().replaceAll("[\\s]+", "-");
        if (slug.length() > 80) slug = slug.substring(0, 80);
        slug = slug + "-" + UUID.randomUUID().toString().substring(0, 8);
        return slug;
    }
}
