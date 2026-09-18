package com.streamify.modules.playlist;

import com.streamify.modules.playlist.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {

    Page<Playlist> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    Page<Playlist> findByOwnerIdAndIsPublicTrueOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);
}
