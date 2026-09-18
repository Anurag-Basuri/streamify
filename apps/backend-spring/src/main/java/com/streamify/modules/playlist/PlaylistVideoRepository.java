package com.streamify.modules.playlist;

import com.streamify.modules.playlist.PlaylistVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaylistVideoRepository extends JpaRepository<PlaylistVideo, UUID> {

    List<PlaylistVideo> findByPlaylistIdOrderByPositionAsc(UUID playlistId);

    Optional<PlaylistVideo> findByPlaylistIdAndVideoId(UUID playlistId, UUID videoId);

    boolean existsByPlaylistIdAndVideoId(UUID playlistId, UUID videoId);

    long countByPlaylistId(UUID playlistId);

    void deleteByPlaylistIdAndVideoId(UUID playlistId, UUID videoId);

    @Query("SELECT COALESCE(MAX(pv.position), 0) FROM PlaylistVideo pv WHERE pv.playlist.id = :playlistId")
    int findMaxPosition(@Param("playlistId") UUID playlistId);
}
