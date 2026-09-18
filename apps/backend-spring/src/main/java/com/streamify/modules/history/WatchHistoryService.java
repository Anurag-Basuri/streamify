package com.streamify.modules.history;

import com.streamify.common.PageResponse;
import com.streamify.modules.history.WatchHistory;
import com.streamify.modules.history.WatchHistoryRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import com.streamify.modules.video.Video;
import com.streamify.modules.video.VideoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class WatchHistoryService {

    private final WatchHistoryRepository watchHistoryRepository;
    private final UserService userService;
    private final VideoService videoService;

    public WatchHistoryService(WatchHistoryRepository watchHistoryRepository,
                               UserService userService,
                               VideoService videoService) {
        this.watchHistoryRepository = watchHistoryRepository;
        this.userService = userService;
        this.videoService = videoService;
    }

    public void addToHistory(UUID userId, UUID videoId, double playbackTimestamp, double videoDuration) {
        User user = userService.findUserById(userId);
        Video video = videoService.findVideoById(videoId);

        WatchHistory entry = watchHistoryRepository.findByUserIdAndVideoId(userId, videoId)
                .orElseGet(() -> {
                    WatchHistory wh = new WatchHistory();
                    wh.setUser(user);
                    wh.setVideo(video);
                    return wh;
                });

        entry.setPlaybackTimestamp(playbackTimestamp);
        entry.setVideoDuration(videoDuration);
        entry.setWatchedAt(Instant.now());
        watchHistoryRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getHistory(UUID userId, int page, int limit) {
        Page<WatchHistory> historyPage = watchHistoryRepository
                .findByUserIdOrderByWatchedAtDesc(userId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = historyPage.getContent().stream()
                .map(wh -> {
                    Video v = wh.getVideo();
                    return Map.<String, Object>of(
                            "id", wh.getId().toString(),
                            "videoId", v.getId().toString(),
                            "title", v.getTitle(),
                            "thumbnailUrl", v.getThumbnailUrl(),
                            "duration", v.getDuration(),
                            "playbackTimestamp", wh.getPlaybackTimestamp(),
                            "watchedAt", wh.getWatchedAt().toString()
                    );
                }).toList();

        return PageResponse.of(docs, historyPage.getTotalElements(), page, limit);
    }

    public void clearHistory(UUID userId) {
        watchHistoryRepository.deleteAllByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(UUID userId) {
        long count = watchHistoryRepository.countByUserId(userId);
        return Map.of("totalWatched", count);
    }
}
