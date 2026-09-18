package com.streamify.modules.subscription;

import java.time.Instant;
import java.util.UUID;

/**
 * Typed DTOs for the Subscription module.
 */
public final class SubscriptionDtos {

    private SubscriptionDtos() {}

    public record SubscriptionToggleResponse(
            boolean subscribed,
            long subscriberCount
    ) {}

    public record SubscriptionCheckResponse(
            boolean isSubscribed
    ) {}

    public record SubscribedChannelResponse(
            UUID channelId,
            String userName,
            String fullName,
            String avatar,
            long subscriberCount,
            Instant subscribedAt
    ) {}

    public record SubscriberResponse(
            UUID subscriberId,
            String userName,
            String fullName,
            String avatar,
            Instant subscribedAt
    ) {}
}
