package com.streamify.modules.comment;

import com.streamify.common.ApiResponse;
import com.streamify.common.PageResponse;
import com.streamify.modules.comment.CommentDtos.*;
import com.streamify.modules.comment.CommentService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
@Tag(name = "Comments", description = "Comment CRUD and threading")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/{entityType}/{entityId}")
    @Operation(summary = "Add a comment to a video or tweet")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCommentRequest request) {

        CommentResponse comment = commentService.addComment(
                principal.getId(), capitalize(entityType), entityId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(comment, "Comment added successfully"));
    }

    @GetMapping("/{entityType}/{entityId}")
    @Operation(summary = "Get comments for a video or tweet")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getComments(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<CommentResponse> comments = commentService.getComments(
                capitalize(entityType), entityId, currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(comments));
    }

    @GetMapping("/{commentId}/replies")
    @Operation(summary = "Get replies to a comment")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getReplies(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        PageResponse<CommentResponse> replies = commentService.getReplies(commentId, currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(replies));
    }

    @PatchMapping("/{commentId}")
    @Operation(summary = "Update a comment")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateCommentRequest request) {

        CommentResponse comment = commentService.updateComment(commentId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(comment, "Comment updated successfully"));
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "Update a comment (Alias)")
    public ResponseEntity<ApiResponse<CommentResponse>> updateCommentPut(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateCommentRequest request) {
        return updateComment(commentId, principal, request);
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal) {

        commentService.deleteComment(commentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Comment deleted successfully"));
    }

    @PatchMapping("/{commentId}/pin")
    @Operation(summary = "Toggle pin on a comment")
    public ResponseEntity<ApiResponse<CommentResponse>> togglePin(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal) {

        CommentResponse comment = commentService.togglePin(commentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(comment, "Pin toggled"));
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }
}
