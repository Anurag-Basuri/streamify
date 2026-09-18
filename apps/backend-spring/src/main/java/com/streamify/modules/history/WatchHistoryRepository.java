package com.streamify.modules.history;

import com.streamify.modules.history.WatchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, UUID> {

    Page<WatchHistory> findByUserIdOrderByWatchedAtDesc(UUID userId, Pageable pageable);

    Optional<WatchHistory> findByUserIdAndVideoId(UUID userId, UUID videoId);

    @Modifying
    @Query("DELETE FROM WatchHistory wh WHERE wh.user.id = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);

    long countByUserId(UUID userId);
}
