/**
 * SearchBar Component (Legacy)
 * Note: This is kept for backward compatibility.
 * The Header component now has its own built-in SearchBar.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import PropTypes from "prop-types";

export const SearchBar = ({
    searchQuery,
    setSearchQuery,
    showTrending,
    setShowTrending,
    trendingTopics,
    handleSearch,
    isTweetPage,
}) => (
    <div className="flex-1 max-w-2xl mx-2 relative">
        <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowTrending(true)}
                placeholder={`Search ${isTweetPage ? "tweets" : "videos"}...`}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border 
                    bg-[var(--input-bg)] border-[var(--input-border)] 
                    text-[var(--text-primary)] placeholder-[var(--input-placeholder)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] 
                    focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
        </form>

        <AnimatePresence>
            {showTrending && searchQuery.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl shadow-xl border 
                        bg-[var(--bg-elevated)] border-[var(--border-light)] z-50"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp
                                size={16}
                                className="text-[var(--brand-primary)]"
                            />
                            <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                                Trending
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => {
                                        setSearchQuery(topic);
                                        setShowTrending(false);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-sm 
                                        bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                                        hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                                        transition-colors"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

SearchBar.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    showTrending: PropTypes.bool.isRequired,
    setShowTrending: PropTypes.func.isRequired,
    trendingTopics: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleSearch: PropTypes.func.isRequired,
    isTweetPage: PropTypes.bool.isRequired,
};

export default SearchBar;
