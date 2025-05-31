import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useVideo from "../../hooks/useVideo";
import { EmptyState, LoadingState, ErrorState } from "../../components/Video";
import {
    VideoHeader,
    SearchFilterBar,
    VideoGrid,
} from "../../components/Account";

const YourVideos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        videos,
        loading,
        error,
        fetchVideos,
        updateVideo,
        deleteVideo,
        togglePublish,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
    } = useVideo(user);

    // Debounce search to avoid excessive API calls
    const searchTimeout = useRef();

    useEffect(() => {
        if (!user) {
            navigate("/signin?redirect=/videos");
            return;
        }
        fetchVideos();
        // eslint-disable-next-line
    }, [user]);

    useEffect(() => {
        if (!user) return;
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchVideos();
        }, 400);
        return () => clearTimeout(searchTimeout.current);
        // eslint-disable-next-line
    }, [searchQuery, sortBy]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={fetchVideos} />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                <VideoHeader
                    videoCount={videos.length}
                    publishedCount={videos.filter((v) => v.isPublished).length}
                />

                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    options={[
                        { value: "recent", label: "Recently Added" },
                        { value: "popular", label: "Most Viewed" },
                        { value: "oldest", label: "Oldest First" },
                    ]}
                />

                <AnimatePresence mode="popLayout">
                    {videos.length === 0 ? (
                        <EmptyState
                            title="No Videos Yet"
                            description="Start uploading videos to build your collection"
                            actionLabel="Upload Video"
                            onAction={() => navigate("/upload")}
                        />
                    ) : (
                        <VideoGrid
                            videos={videos}
                            onDelete={deleteVideo}
                            onTogglePublish={togglePublish}
                            onEdit={(videoId) =>
                                navigate(`/videos/edit/${videoId}`)
                            }
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default YourVideos;
