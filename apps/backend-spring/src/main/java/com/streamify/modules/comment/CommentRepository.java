package com.streamify.modules.comment;

import com.streamify.modules.comment.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    // Top-level comments on an entity (no parent)
    Page<Comment> findByEntityTypeAndEntityIdAndParentIsNullOrderByPinnedDescCreatedAtDesc(
            String entityType, UUID entityId, Pageable pageable);

    // Replies to a comment
    Page<Comment> findByParentIdOrderByCreatedAtAsc(UUID parentId, Pageable pageable);

    // Count comments on an entity
    long countByEntityTypeAndEntityIdAndParentIsNull(String entityType, UUID entityId);

    // Count replies
    long countByParentId(UUID parentId);

    // Increment reply count
    @Modifying
    @Query("UPDATE Comment c SET c.replyCount = c.replyCount + 1 WHERE c.id = :parentId")
    void incrementReplyCount(@Param("parentId") UUID parentId);

    // Decrement reply count
    @Modifying
    @Query("UPDATE Comment c SET c.replyCount = GREATEST(c.replyCount - 1, 0) WHERE c.id = :parentId")
    void decrementReplyCount(@Param("parentId") UUID parentId);
}
