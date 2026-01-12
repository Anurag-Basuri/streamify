/**
 * Search Results Page
 * Displays search results with filters and sorting
 */
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSearch,
    FiFilter,
    FiX,
    FiCalendar,
    FiClock,
    FiTrendingUp,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { api } from "../../services/api";
import { PageTransition, EmptyState } from "../../components/Common";
import VideoCard from "../../components/Video/VideoCard";
import { VideoCardSkeleton } from "../../components/Video/VideoCardSkeleton";
import { showError } from "../../components/Common/ToastProvider";
import useDebounce from "../../hooks/useDebounce";

// ============================================================================
// FILTER SIDEBAR
// ============================================================================

const FilterSidebar = ({ filters, onChange, onClear }) => {
    const sortOptions = [
        { value: "relevance", label: "Relevance", icon: FiSearch },
        { value: "date", label: "Upload Date", icon: FiCalendar },
        { value: "views", label: "View Count", icon: FiTrendingUp },
        { value: "duration", label: "Duration", icon: FiClock },
    ];

    const durationOptions = [
        { value: "any", label: "Any" },
        { value: "short", label: "Under 4 minutes" },
        { value: "medium", label: "4-20 minutes" },
        { value: "long", label: "Over 20 minutes" },
    ];

    const uploadDateOptions = [
        { value: "any", label: "Any time" },
        { value: "hour", label: "Last hour" },
        { value: "today", label: "Today" },
        { value: "week", label: "This week" },
        { value: "month", label: "This month" },
        { value: "year", label: "This year" },
    ];

    return (
        <div className="card p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">
                    Filters
                </h3>
                <button
                    onClick={onClear}
                    className="text-sm text-[var(--brand-primary)] hover:underline"
                >
                    Clear all
                </button>
            </div>

            {/* Sort By */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Sort by
                </label>
                <div className="space-y-1">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() =>
                                onChange({ ...filters, sortBy: option.value })
                            }
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                                filters.sortBy === option.value
                                    ? "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
                                    : "hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                            }`}
                        >
                            <option.icon size={16} />
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Duration
                </label>
                <select
                    value={filters.duration}
                    onChange={(e) =>
                        onChange({ ...filters, duration: e.target.value })
                    }
                    className="input w-full text-sm"
                >
                    {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Upload Date */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Upload date
                </label>
                <select
                    value={filters.uploadDate}
                    onChange={(e) =>
                        onChange({ ...filters, uploadDate: e.target.value })
                    }
                    className="input w-full text-sm"
                >
                    {uploadDateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();

    const query = searchParams.get("q") || "";
    const [searchInput, setSearchInput] = useState(query);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: "relevance",
        duration: "any",
        uploadDate: "any",
    });

    const debouncedSearch = useDebounce(searchInput, 300);

    useEffect(() => {
        if (debouncedSearch) {
            setSearchParams({ q: debouncedSearch });
        }
    }, [debouncedSearch, setSearchParams]);

    useEffect(() => {
        if (query) {
            performSearch();
        } else {
            setVideos([]);
            setLoading(false);
        }
    }, [query, filters]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                query,
                sortBy: filters.sortBy,
                ...(filters.duration !== "any" && {
                    duration: filters.duration,
                }),
                ...(filters.uploadDate !== "any" && {
                    uploadDate: filters.uploadDate,
                }),
            });

            const response = await api.get(`/api/v1/videos?${params}`);
            setVideos(response.data?.data?.docs || []);
        } catch (error) {
            showError("Search failed");
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoAction = useCallback(async (action, videoId) => {
        // Handle video actions
    }, []);

    const clearFilters = () => {
        setFilters({
            sortBy: "relevance",
            duration: "any",
            uploadDate: "any",
        });
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Search Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 relative">
                            <FiSearch
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                                size={20}
                            />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search videos..."
                                className="input w-full pl-12 pr-10"
                                autoFocus
                            />
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput("");
                                        setSearchParams({});
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                >
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn btn-secondary gap-2 ${
                                showFilters
                                    ? "bg-[var(--brand-primary-light)]"
                                    : ""
                            }`}
                        >
                            <FiFilter size={18} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {query && (
                        <p className="text-[var(--text-tertiary)]">
                            {loading
                                ? "Searching..."
                                : `${videos.length} results for "${query}"`}
                        </p>
                    )}
                </motion.div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Filter Sidebar */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.aside
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="hidden md:block w-64 flex-shrink-0"
                            >
                                <FilterSidebar
                                    filters={filters}
                                    onChange={setFilters}
                                    onClear={clearFilters}
                                />
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Results */}
                    <div className="flex-1">
                        {!query ? (
                            <EmptyState
                                icon={FiSearch}
                                title="Start searching"
                                description="Enter a search term to find videos"
                            />
                        ) : loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <VideoCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : videos.length === 0 ? (
                            <EmptyState
                                preset="noSearchResults"
                                title="No results found"
                                description={`No videos matched "${query}". Try different keywords.`}
                                actionLabel="Clear search"
                                onAction={() => {
                                    setSearchInput("");
                                    setSearchParams({});
                                }}
                            />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                            >
                                {videos.map((video, index) => (
                                    <motion.div
                                        key={video._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <VideoCard
                                            video={video}
                                            onAction={handleVideoAction}
                                            isAuthenticated={isAuthenticated}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SearchResults;
