package com.streamify.modules.video;

import com.streamify.modules.video.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {

    // ---- Public feed (published, not deleted) ----
    @Query("SELECT v FROM Video v WHERE v.published = true AND v.deleted = false ORDER BY v.createdAt DESC")
    Page<Video> findPublishedVideos(Pageable pageable);

    // ---- Owner's videos (includes unpublished) ----
    Page<Video> findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    // ---- Published videos by owner ----
    Page<Video> findByOwnerIdAndPublishedTrueAndDeletedFalseOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    // ---- By slug ----
    Optional<Video> findBySlugAndDeletedFalse(String slug);

    // ---- Full-text search ----
    @Query(value = "SELECT * FROM videos WHERE search_vector @@ plainto_tsquery('english', :query) " +
            "AND is_published = true AND is_deleted = false " +
            "ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC",
            countQuery = "SELECT count(*) FROM videos WHERE search_vector @@ plainto_tsquery('english', :query) " +
                    "AND is_published = true AND is_deleted = false",
            nativeQuery = true)
    Page<Video> searchPublished(@Param("query") String query, Pageable pageable);

    // ---- By tag ----
    @Query(value = "SELECT * FROM videos WHERE :tag = ANY(tags) AND is_published = true AND is_deleted = false " +
            "ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM videos WHERE :tag = ANY(tags) AND is_published = true AND is_deleted = false",
            nativeQuery = true)
    Page<Video> findByTag(@Param("tag") String tag, Pageable pageable);

    // ---- Trending (most viewed in recent period) ----
    @Query(value = "SELECT * FROM videos WHERE is_published = true AND is_deleted = false " +
            "AND created_at > NOW() - INTERVAL '7 days' ORDER BY views DESC",
            nativeQuery = true)
    List<Video> findTrending(Pageable pageable);

    // ---- Recommendations (simple: same owner or same tags, excluding current video) ----
    @Query(value = "SELECT * FROM videos WHERE id <> :videoId AND is_published = true AND is_deleted = false " +
            "AND (owner_id = :ownerId OR tags && :tags) " +
            "ORDER BY views DESC LIMIT :limit",
            nativeQuery = true)
    List<Video> findRecommendations(@Param("videoId") UUID videoId,
                                    @Param("ownerId") UUID ownerId,
                                    @Param("tags") String[] tags,
                                    @Param("limit") int limit);

    // ---- Increment views atomically ----
    @Modifying
    @Query("UPDATE Video v SET v.views = v.views + 1 WHERE v.id = :videoId")
    void incrementViews(@Param("videoId") UUID videoId);

    // ---- Soft delete ----
    @Modifying
    @Query("UPDATE Video v SET v.deleted = true WHERE v.id = :videoId AND v.owner.id = :ownerId")
    int softDelete(@Param("videoId") UUID videoId, @Param("ownerId") UUID ownerId);

    // ---- Count by owner ----
    long countByOwnerIdAndDeletedFalse(UUID ownerId);

    // ---- Sum views by owner ----
    @Query("SELECT COALESCE(SUM(v.views), 0) FROM Video v WHERE v.owner.id = :ownerId AND v.deleted = false")
    long sumViewsByOwner(@Param("ownerId") UUID ownerId);
}
