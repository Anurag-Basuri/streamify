package com.streamify.modules.watchlater;

import com.streamify.modules.watchlater.WatchLater;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchLaterRepository extends JpaRepository<WatchLater, UUID> {

    Page<WatchLater> findByUserIdOrderByAddedAtDesc(UUID userId, Pageable pageable);

    Optional<WatchLater> findByUserIdAndVideoId(UUID userId, UUID videoId);

    boolean existsByUserIdAndVideoId(UUID userId, UUID videoId);

    void deleteByUserIdAndVideoId(UUID userId, UUID videoId);

    long countByUserId(UUID userId);

    void deleteAllByUserId(UUID userId);
}
