package com.streamify.modules.dashboard;

import com.streamify.modules.like.LikeRepository;
import com.streamify.modules.subscription.SubscriptionRepository;
import com.streamify.modules.video.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Dashboard service replacing the complex MongoDB aggregation pipeline
 * in the original dashboard.service.js with equivalent SQL queries.
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final VideoRepository videoRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final LikeRepository likeRepository;

    public DashboardService(VideoRepository videoRepository,
                            SubscriptionRepository subscriptionRepository,
                            LikeRepository likeRepository) {
        this.videoRepository = videoRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.likeRepository = likeRepository;
    }

    /**
     * Get channel statistics matching the Node.js getChannelStats endpoint.
     * Original used a complex MongoDB $facet aggregation; now uses simple JPA count queries.
     */
    public Map<String, Object> getChannelStats(UUID channelId) {
        long totalVideos = videoRepository.countByOwnerIdAndDeletedFalse(channelId);
        long totalViews = videoRepository.sumViewsByOwner(channelId);
        long totalSubscribers = subscriptionRepository.countByChannelId(channelId);
        long totalSubscriptions = subscriptionRepository.countBySubscriberId(channelId);

        return Map.of(
                "totalVideos", totalVideos,
                "totalViews", totalViews,
                "totalSubscribers", totalSubscribers,
                "totalSubscriptions", totalSubscriptions
        );
    }
}
