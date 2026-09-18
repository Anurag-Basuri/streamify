package com.streamify.modules.watchlater;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import com.streamify.modules.video.Video;
import com.streamify.modules.video.VideoService;
import com.streamify.modules.watchlater.WatchLater;
import com.streamify.modules.watchlater.WatchLaterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class WatchLaterService {

    private final WatchLaterRepository watchLaterRepository;
    private final UserService userService;
    private final VideoService videoService;

    public WatchLaterService(WatchLaterRepository watchLaterRepository,
                             UserService userService,
                             VideoService videoService) {
        this.watchLaterRepository = watchLaterRepository;
        this.userService = userService;
        this.videoService = videoService;
    }

    public Map<String, Object> toggleWatchLater(UUID userId, UUID videoId) {
        var existing = watchLaterRepository.findByUserIdAndVideoId(userId, videoId);

        boolean saved;
        if (existing.isPresent()) {
            watchLaterRepository.delete(existing.get());
            saved = false;
        } else {
            User user = userService.findUserById(userId);
            Video video = videoService.findVideoById(videoId);
            WatchLater wl = new WatchLater();
            wl.setUser(user);
            wl.setVideo(video);
            watchLaterRepository.save(wl);
            saved = true;
        }

        return Map.of("saved", saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getWatchLaterList(UUID userId, int page, int limit) {
        Page<WatchLater> wlPage = watchLaterRepository
                .findByUserIdOrderByAddedAtDesc(userId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = wlPage.getContent().stream()
                .map(wl -> {
                    Video v = wl.getVideo();
                    return Map.<String, Object>of(
                            "id", wl.getId().toString(),
                            "videoId", v.getId().toString(),
                            "title", v.getTitle(),
                            "thumbnailUrl", v.getThumbnailUrl(),
                            "duration", v.getDuration(),
                            "views", v.getViews(),
                            "addedAt", wl.getAddedAt().toString()
                    );
                }).toList();

        return PageResponse.of(docs, wlPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public boolean isSaved(UUID userId, UUID videoId) {
        return watchLaterRepository.existsByUserIdAndVideoId(userId, videoId);
    }

    public void clearWatchLater(UUID userId) {
        watchLaterRepository.deleteAllByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(UUID userId) {
        long count = watchLaterRepository.countByUserId(userId);
        return Map.of("totalSaved", count);
    }
}
