/**
 * useVideoPlayer Hook
 * Manages state and actions for the video player page
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { getVideoById, incrementViews } from "../services/videoService";
import {
    getComments,
    addComment as addCommentService,
} from "../services/commentService";
import { toggleVideoLike, toggleCommentLike } from "../services/likeService";
import { addToHistory } from "../services/historyService";

/**
 * Custom hook for video player functionality
 * @param {string} videoId - Video ID from URL params
 * @param {boolean} isAuthenticated - Whether user is logged in
 * @returns {Object} Video player state and actions
 */
const useVideoPlayer = (videoId, isAuthenticated) => {
    // Video state
    const [video, setVideo] = useState(null);
    const [videoLoading, setVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState(null);

    // Like state
    const [likeState, setLikeState] = useState({
        isLiked: false,
        likesCount: 0,
    });
    const [isLiking, setIsLiking] = useState(false);

    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsPagination, setCommentsPagination] = useState({
        page: 1,
        totalPages: 1,
        hasMore: false,
    });

    // Tracking state
    const viewTracked = useRef(false);
    const historyTracked = useRef(false);

    // =========================================================================
    // VIDEO ACTIONS
    // =========================================================================

    /**
     * Fetch video details
     */
    const fetchVideo = useCallback(async () => {
        if (!videoId) return;

        setVideoLoading(true);
        setVideoError(null);

        try {
            const data = await getVideoById(videoId);
            setVideo(data);
            setLikeState({
                isLiked: data.isLiked || false,
                likesCount: data.likesCount || 0,
            });
        } catch (error) {
            console.error("Failed to fetch video:", error);
            setVideoError(error.message || "Failed to load video");
        } finally {
            setVideoLoading(false);
        }
    }, [videoId]);

    /**
     * Handle video play - track view and history
     */
    const handleVideoPlay = useCallback(async () => {
        if (!videoId) return;

        // Track view (once per session)
        if (!viewTracked.current) {
            viewTracked.current = true;
            incrementViews(videoId).catch(console.error);
        }

        // Track history (once per session, only if authenticated)
        if (!historyTracked.current && isAuthenticated) {
            historyTracked.current = true;
            addToHistory(videoId).catch(console.error);
        }
    }, [videoId, isAuthenticated]);

    /**
     * Toggle video like
     */
    const handleLike = useCallback(async () => {
        if (!video?._id || isLiking) return;

        const previousState = { ...likeState };

        // Optimistic update
        setIsLiking(true);
        setLikeState((prev) => ({
            isLiked: !prev.isLiked,
            likesCount: prev.isLiked
                ? Math.max(0, prev.likesCount - 1)
                : prev.likesCount + 1,
        }));

        try {
            const result = await toggleVideoLike(video._id);
            setLikeState({
                isLiked: result.state === 1,
                likesCount: result.likes || 0,
            });
        } catch (error) {
            // Rollback on error
            setLikeState(previousState);
            throw error;
        } finally {
            setIsLiking(false);
        }
    }, [video?._id, isLiking, likeState]);

    // =========================================================================
    // COMMENT ACTIONS
    // =========================================================================

    /**
     * Fetch comments for the video
     */
    const fetchComments = useCallback(
        async (page = 1, append = false) => {
            if (!videoId) return;

            if (page === 1) {
                setCommentsLoading(true);
            }

            try {
                const data = await getComments("Video", videoId, {
                    page,
                    limit: 10,
                });

                if (append) {
                    setComments((prev) => [...prev, ...(data.comments || [])]);
                } else {
                    setComments(data.comments || []);
                }

                setCommentsPagination({
                    page: data.pagination?.currentPage || page,
                    totalPages: data.pagination?.totalPages || 1,
                    hasMore: page < (data.pagination?.totalPages || 1),
                });
            } catch (error) {
                console.error("Failed to fetch comments:", error);
            } finally {
                setCommentsLoading(false);
            }
        },
        [videoId]
    );

    /**
     * Load more comments
     */
    const loadMoreComments = useCallback(async () => {
        if (!commentsPagination.hasMore) return;
        await fetchComments(commentsPagination.page + 1, true);
    }, [fetchComments, commentsPagination]);

    /**
     * Add a new comment
     */
    const addComment = useCallback(
        async (content) => {
            if (!videoId || !content.trim()) return;

            const newComment = await addCommentService(
                "Video",
                videoId,
                content.trim()
            );

            // Add to comments list with owner info
            setComments((prev) => [newComment, ...prev]);

            return newComment;
        },
        [videoId]
    );

    /**
     * Toggle comment like with optimistic update
     */
    const handleCommentLike = useCallback(
        async (commentId) => {
            // Find the comment and get previous state
            const commentIndex = comments.findIndex((c) => c._id === commentId);
            if (commentIndex === -1) return;

            const previousComments = [...comments];

            // Optimistic update
            setComments((prev) =>
                prev.map((c) =>
                    c._id === commentId
                        ? {
                              ...c,
                              isLiked: !c.isLiked,
                              likesCount: c.isLiked
                                  ? Math.max(0, (c.likesCount || 0) - 1)
                                  : (c.likesCount || 0) + 1,
                          }
                        : c
                )
            );

            try {
                const result = await toggleCommentLike(commentId);

                // Update with server response
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === commentId
                            ? {
                                  ...c,
                                  isLiked: result.isLiked,
                                  likesCount: result.likes || 0,
                              }
                            : c
                    )
                );
            } catch (error) {
                // Rollback on error
                setComments(previousComments);
                throw error;
            }
        },
        [comments]
    );

    // =========================================================================
    // EFFECTS
    // =========================================================================

    // Fetch video on mount or videoId change
    useEffect(() => {
        fetchVideo();
        fetchComments();

        // Reset tracking refs
        viewTracked.current = false;
        historyTracked.current = false;
    }, [fetchVideo, fetchComments]);

    // Update like state when video changes
    useEffect(() => {
        if (video) {
            setLikeState({
                isLiked: video.isLiked || false,
                likesCount: video.likesCount || 0,
            });
        }
    }, [video]);

    return {
        // Video
        video,
        videoLoading,
        videoError,
        fetchVideo,
        handleVideoPlay,

        // Likes
        likeState,
        isLiking,
        handleLike,

        // Comments
        comments,
        commentsLoading,
        commentsPagination,
        fetchComments,
        loadMoreComments,
        addComment,
        handleCommentLike,
    };
};

export default useVideoPlayer;
