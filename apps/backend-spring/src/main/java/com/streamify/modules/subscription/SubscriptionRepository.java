package com.streamify.modules.subscription;

import com.streamify.modules.subscription.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findBySubscriberIdAndChannelId(UUID subscriberId, UUID channelId);

    boolean existsBySubscriberIdAndChannelId(UUID subscriberId, UUID channelId);

    long countByChannelId(UUID channelId);

    long countBySubscriberId(UUID subscriberId);

    // Subscribers of a channel
    Page<Subscription> findByChannelIdOrderByCreatedAtDesc(UUID channelId, Pageable pageable);

    // Channels a user subscribes to
    Page<Subscription> findBySubscriberIdOrderByCreatedAtDesc(UUID subscriberId, Pageable pageable);

    void deleteBySubscriberIdAndChannelId(UUID subscriberId, UUID channelId);

    @Query("SELECT s.subscriberId FROM Subscription s WHERE s.channelId = :channelId")
    java.util.List<UUID> findSubscriberIdsByChannelId(@Param("channelId") UUID channelId);
}
