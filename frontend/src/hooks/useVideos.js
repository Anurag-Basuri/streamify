import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getAllVideos } from "../services/videoService";

/**
 * Custom hook for fetching and managing video list with pagination
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Object} user - Current user object
 * @returns {Object} Video state and controls
 */
const useVideos = (isAuthenticated, user) => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const fetchVideos = useCallback(
        async (pageNum, reset = false) => {
            // Cancel any ongoing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            try {
                setError(null);

                if (pageNum === 1) {
                    setIsLoading(true);
                } else {
                    setLoadingMore(true);
                }

                const data = await getAllVideos({
                    page: pageNum,
                    limit: 12,
                    sort: "-createdAt",
                });

                const formattedVideos = data.videos.map((video) => ({
                    ...video,
                    isLiked: isAuthenticated
                        ? video.likes?.includes(user?._id)
                        : false,
                }));

                if (reset || pageNum === 1) {
                    setVideos(formattedVideos);
                } else {
                    setVideos((prev) => [...prev, ...formattedVideos]);
                }

                setHasMore(data.hasNextPage);
            } catch (err) {
                // Ignore abort errors
                if (
                    err.name === "AbortError" ||
                    err.message?.includes("canceled")
                ) {
                    return;
                }

                console.error("Failed to load videos:", err);
                setError(err.message || "Failed to load videos");

                // Only show toast for non-initial loads
                if (pageNum > 1) {
                    toast.error("Failed to load more videos");
                }
            } finally {
                setIsLoading(false);
                setLoadingMore(false);
            }
        },
        [isAuthenticated, user?._id]
    );

    // Initial fetch
    useEffect(() => {
        setPage(1);
        fetchVideos(1, true);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchVideos]);

    // Handle page changes
    useEffect(() => {
        if (page > 1) {
            fetchVideos(page);
        }
    }, [page, fetchVideos]);

    // Load more function
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            setPage((prev) => prev + 1);
        }
    }, [loadingMore, hasMore]);

    // Refresh function
    const refresh = useCallback(() => {
        setPage(1);
        fetchVideos(1, true);
    }, [fetchVideos]);

    return {
        videos,
        setVideos,
        isLoading,
        error,
        page,
        setPage,
        hasMore,
        loadingMore,
        loadMore,
        refresh,
    };
};

export default useVideos;
