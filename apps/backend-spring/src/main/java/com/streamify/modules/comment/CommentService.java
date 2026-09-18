package com.streamify.modules.comment;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.comment.CommentDtos.*;
import com.streamify.modules.comment.Comment;
import com.streamify.modules.comment.CommentRepository;
import com.streamify.modules.like.LikeRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository,
                          LikeRepository likeRepository,
                          UserService userService) {
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.userService = userService;
    }

    public CommentResponse addComment(UUID userId, String entityType, UUID entityId, CreateCommentRequest req) {
        User user = userService.findUserById(userId);

        Comment comment = new Comment();
        comment.setOwner(user);
        comment.setEntityType(entityType);
        comment.setEntityId(entityId);
        comment.setContent(req.content());

        if (req.parentId() != null && !req.parentId().isBlank()) {
            UUID parentId = UUID.fromString(req.parentId());
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> ApiException.notFound("Parent comment"));
            comment.setParent(parent);
            commentRepository.incrementReplyCount(parentId);
        }

        comment = commentRepository.save(comment);
        return toCommentResponse(comment, userId);
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> getComments(String entityType, UUID entityId,
                                                      UUID currentUserId, int page, int limit) {
        Page<Comment> commentPage = commentRepository
                .findByEntityTypeAndEntityIdAndParentIsNullOrderByPinnedDescCreatedAtDesc(
                        entityType, entityId, PageRequest.of(page - 1, limit));

        List<CommentResponse> docs = commentPage.getContent().stream()
                .map(c -> toCommentResponse(c, currentUserId))
                .toList();

        return PageResponse.of(docs, commentPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> getReplies(UUID parentId, UUID currentUserId, int page, int limit) {
        Page<Comment> replyPage = commentRepository
                .findByParentIdOrderByCreatedAtAsc(parentId, PageRequest.of(page - 1, limit));

        List<CommentResponse> docs = replyPage.getContent().stream()
                .map(c -> toCommentResponse(c, currentUserId))
                .toList();

        return PageResponse.of(docs, replyPage.getTotalElements(), page, limit);
    }

    public CommentResponse updateComment(UUID commentId, UUID userId, UpdateCommentRequest req) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment"));

        if (!comment.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("You can only edit your own comments");
        }

        comment.setContent(req.content());
        comment = commentRepository.save(comment);
        return toCommentResponse(comment, userId);
    }

    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment"));

        if (!comment.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("You can only delete your own comments");
        }

        if (comment.getParent() != null) {
            commentRepository.decrementReplyCount(comment.getParent().getId());
        }

        commentRepository.delete(comment);
    }

    public CommentResponse togglePin(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment"));

        // Only the entity owner can pin (not the comment owner)
        comment.setPinned(!comment.isPinned());
        comment = commentRepository.save(comment);
        return toCommentResponse(comment, userId);
    }

    private CommentResponse toCommentResponse(Comment comment, UUID currentUserId) {
        User owner = comment.getOwner();
        long likesCount = likeRepository.countByEntityTypeAndEntityId("Comment", comment.getId());
        boolean isLiked = currentUserId != null &&
                likeRepository.existsByLikedByIdAndEntityTypeAndEntityId(currentUserId, "Comment", comment.getId());

        return new CommentResponse(
                comment.getId().toString(),
                comment.getContent(),
                new OwnerInfo(owner.getId().toString(), owner.getUserName(), owner.getFullName(), owner.getAvatarUrl()),
                comment.getEntityType(),
                comment.getEntityId().toString(),
                comment.getParent() != null ? comment.getParent().getId().toString() : null,
                comment.isPinned(),
                comment.getReplyCount(),
                likesCount,
                isLiked,
                false, // isHearted — TODO: implement comment hearts
                comment.getCreatedAt().toString(),
                comment.getUpdatedAt().toString()
        );
    }
}
