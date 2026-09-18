package com.streamify.modules.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    Page<Activity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Activity> findByUserIdAndTypeOrderByCreatedAtDesc(UUID userId, String type, Pageable pageable);

    Page<Activity> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID userId, Instant startDate, Instant endDate, Pageable pageable);

    Page<Activity> findByUserIdAndTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID userId, String type, Instant startDate, Instant endDate, Pageable pageable);

    long countByUserIdAndCreatedAtGreaterThanEqual(UUID userId, Instant since);

    Optional<Activity> findByIdAndUserId(UUID id, UUID userId);

    @Modifying
    @Query("DELETE FROM Activity a WHERE a.user.id = :userId")
    int deleteAllByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM Activity a WHERE a.user.id = :userId AND a.type = :type")
    int deleteAllByUserIdAndType(@Param("userId") UUID userId, @Param("type") String type);

    @Query("""
        SELECT a.type AS type, COUNT(a) AS count, MAX(a.createdAt) AS lastActivity
        FROM Activity a
        WHERE a.user.id = :userId AND a.createdAt >= :since
        GROUP BY a.type
        ORDER BY COUNT(a) DESC
    """)
    List<Object[]> getActivitySummary(@Param("userId") UUID userId, @Param("since") Instant since);

    @Query("""
        SELECT CAST(a.createdAt AS date) AS actDate, COUNT(a) AS count
        FROM Activity a
        WHERE a.user.id = :userId AND a.createdAt >= :since
        GROUP BY CAST(a.createdAt AS date)
        ORDER BY CAST(a.createdAt AS date) ASC
    """)
    List<Object[]> getDailyActivity(@Param("userId") UUID userId, @Param("since") Instant since);

    List<Activity> findTop10ByUserIdOrderByCreatedAtDesc(UUID userId);
}
