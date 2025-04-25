import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useVideo from "../../hooks/useVideo";
import { VideoCard, EmptyState, LoadingState, ErrorState } from "../../components/Video";
import { SearchBar, SortSelect } from "../../components/Filters";
import { VideoHeader, SearchFilterBar, VideoGrid } from "../../components/Account";

const YourVideos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        videos,
        loading,
        error,
        fetchVideos,
        deleteVideo,
        togglePublish,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
    } = useVideo(user);

    useEffect(() => {
        if (user) fetchVideos();
    }, [user, sortBy, searchQuery]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={fetchVideos} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <VideoHeader
                    videoCount={videos.length}
                    publishedCount={videos.filter((v) => v.isPublished).length}
                />

                <SearchFilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                />

                <AnimatePresence mode="popLayout">
                    {videos.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <VideoGrid
                            videos={videos}
                            onDelete={deleteVideo}
                            onTogglePublish={togglePublish}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default YourVideos;
