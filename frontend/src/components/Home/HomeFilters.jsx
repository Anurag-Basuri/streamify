/**
 * HomeFilters Component
 * Horizontal scrollable list of filter pills for video categories
 * Supports categorization via tags
 */
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "trending", label: "Trending" },
    { id: "music", label: "Music" },
    { id: "gaming", label: "Gaming" },
    { id: "tech", label: "Technology" },
    { id: "news", label: "News" },
    { id: "movies", label: "Movies" },
    { id: "live", label: "Live" },
    { id: "education", label: "Learning" },
    { id: "sports", label: "Sports" },
    { id: "fashion", label: "Fashion" },
    { id: "comedy", label: "Comedy" },
];

export const HomeFilters = ({ activeFilter, onFilterChange }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } =
            scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    const scroll = (direction) => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative group mb-6 px-4 md:px-0">
            {/* Left Scroll Button */}
            {showLeftArrow && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pr-8 pl-2 py-2 h-full flex items-center">
                    <button
                        onClick={() => scroll("left")}
                        className="p-2 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)] border border-[var(--border-light)] shadow-lg transition-all"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4 text-[var(--text-primary)]" />
                    </button>
                </div>
            )}

            {/* Filter Pills Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {CATEGORIES.map((category) => (
                    <motion.button
                        key={category.id}
                        onClick={() => onFilterChange(category.id)}
                        className={`
                            whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                            border
                            ${
                                activeFilter === category.id
                                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent"
                                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-light)] hover:bg-[var(--bg-secondary)]"
                            }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {category.label}
                    </motion.button>
                ))}
            </div>

            {/* Right Scroll Button */}
            {showRightArrow && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pl-8 pr-2 py-2 h-full flex items-center">
                    <button
                        onClick={() => scroll("right")}
                        className="p-2 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)] border border-[var(--border-light)] shadow-lg transition-all"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4 text-[var(--text-primary)]" />
                    </button>
                </div>
            )}
        </div>
    );
};

HomeFilters.propTypes = {
    activeFilter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

export default HomeFilters;
