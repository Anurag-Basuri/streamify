package com.streamify.modules.subscription;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.subscription.Subscription;
import com.streamify.modules.subscription.SubscriptionRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserService userService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserService userService) {
        this.subscriptionRepository = subscriptionRepository;
        this.userService = userService;
    }

    public Map<String, Object> toggleSubscription(UUID subscriberId, UUID channelId) {
        if (subscriberId.equals(channelId)) {
            throw ApiException.badRequest("Cannot subscribe to yourself");
        }

        Optional<Subscription> existing = subscriptionRepository.findBySubscriberIdAndChannelId(subscriberId, channelId);

        boolean subscribed;
        if (existing.isPresent()) {
            subscriptionRepository.delete(existing.get());
            subscribed = false;
        } else {
            User subscriber = userService.findUserById(subscriberId);
            User channel = userService.findUserById(channelId);
            Subscription sub = new Subscription();
            sub.setSubscriber(subscriber);
            sub.setChannel(channel);
            subscriptionRepository.save(sub);
            subscribed = true;
        }

        long count = subscriptionRepository.countByChannelId(channelId);
        return Map.of("subscribed", subscribed, "subscribersCount", count);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getSubscribers(UUID channelId, int page, int limit) {
        Page<Subscription> subPage = subscriptionRepository
                .findByChannelIdOrderByCreatedAtDesc(channelId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = subPage.getContent().stream()
                .map(s -> {
                    User u = s.getSubscriber();
                    return Map.<String, Object>of(
                            "id", u.getId().toString(),
                            "userName", u.getUserName(),
                            "fullName", u.getFullName(),
                            "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                            "subscribedAt", s.getCreatedAt().toString()
                    );
                }).toList();

        return PageResponse.of(docs, subPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getSubscribedChannels(UUID subscriberId, int page, int limit) {
        Page<Subscription> subPage = subscriptionRepository
                .findBySubscriberIdOrderByCreatedAtDesc(subscriberId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = subPage.getContent().stream()
                .map(s -> {
                    User c = s.getChannel();
                    return Map.<String, Object>of(
                            "id", c.getId().toString(),
                            "userName", c.getUserName(),
                            "fullName", c.getFullName(),
                            "avatarUrl", c.getAvatarUrl() != null ? c.getAvatarUrl() : "",
                            "subscribedAt", s.getCreatedAt().toString()
                    );
                }).toList();

        return PageResponse.of(docs, subPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public boolean isSubscribed(UUID subscriberId, UUID channelId) {
        return subscriptionRepository.existsBySubscriberIdAndChannelId(subscriberId, channelId);
    }

    @Transactional(readOnly = true)
    public long getSubscriberCount(UUID channelId) {
        return subscriptionRepository.countByChannelId(channelId);
    }

    @Transactional(readOnly = true)
    public long getSubscribedChannelCount(UUID subscriberId) {
        return subscriptionRepository.countBySubscriberId(subscriberId);
    }
}
