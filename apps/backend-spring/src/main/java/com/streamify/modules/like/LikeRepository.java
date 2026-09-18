package com.streamify.modules.like;

import com.streamify.modules.like.Like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    Optional<Like> findByLikedByIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);

    boolean existsByLikedByIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);

    long countByEntityTypeAndEntityId(String entityType, UUID entityId);

    Page<Like> findByLikedByIdAndEntityTypeOrderByCreatedAtDesc(UUID userId, String entityType, Pageable pageable);

    void deleteByLikedByIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);
}
