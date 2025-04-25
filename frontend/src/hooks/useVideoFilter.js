import { useMemo } from 'react';

export const useVideoFilter = (videos, filter, sortBy) => {
    return useMemo(() => {
        let filteredVideos = [...videos];

        // Apply filters
        if (filter === 'today') {
            const today = new Date().toDateString();
            filteredVideos = filteredVideos.filter(
                video => new Date(video.addedAt).toDateString() === today
            );
        } else if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredVideos = filteredVideos.filter(
                video => new Date(video.addedAt) >= weekAgo
            );
        }

        // Apply sorting
        if (sortBy === 'recent') {
            filteredVideos.sort((a, b) => 
                new Date(b.addedAt) - new Date(a.addedAt)
            );
        }

        return filteredVideos;
    }, [videos, filter, sortBy]);
};