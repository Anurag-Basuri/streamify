import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const useVideos = (isAuthenticated, user) => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const controller = useRef(new AbortController());

    const fetchVideos = useCallback(async (pageNum) => {
        console.log('Fetching videos for page:', pageNum);
        try {
            setLoadingMore(pageNum > 1);
            const { data } = await axios.get(`/api/v1/videos`, {
                headers: isAuthenticated ? {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                } : {},
                params: {
                    page: pageNum,
                    limit: 10,
                    sort: '-createdAt'
                }
            });

            console.log('Fetched videos:', data);

            const formattedVideos = data.data.videos.map(video => ({
                ...video,
                isLiked: isAuthenticated ? video.likes?.includes(user?._id) : false
            }));

            setVideos(pageNum === 1 ? formattedVideos : prev => [...prev, ...formattedVideos]);
            setHasMore(data.data.videos.length > 0 && data.data.hasNextPage);
        } catch (error) {
            if (!axios.isCancel(error)) {
                toast.error(error.response?.data?.message || 'Failed to load videos');
            }
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [isAuthenticated, user?._id]);

    return {
        videos,
        setVideos,
        isLoading,
        page,
        setPage,
        hasMore,
        loadingMore,
        fetchVideos,
        controller
    };
};

export default useVideos;