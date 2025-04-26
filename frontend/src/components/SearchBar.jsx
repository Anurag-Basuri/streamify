import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import PropTypes from "prop-types";

export const SearchBar = ({
    searchQuery,
    setSearchQuery,
    showTrending,
    setShowTrending,
    trendingTopics,
    handleSearch,
    isTweetPage,
    theme,
}) => (
    <div className="flex-1 max-w-2xl mx-2 relative">
        <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowTrending(true)}
                placeholder={`Search ${isTweetPage ? "tweets" : "videos"}...`}
                className={`w-full pl-12 pr-4 py-2.5 rounded-xl border ${
                    theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
            />
        </form>

        <AnimatePresence>
            {showTrending && searchQuery.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-xl shadow-lg border ${
                        theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <div className="space-y-4">
                        <h3
                            className={`text-sm font-medium ${
                                theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-600"
                            }`}
                        >
                            Trending
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => {
                                        setSearchQuery(topic);
                                        setShowTrending(false);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm ${
                                        theme === "dark"
                                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    } transition-colors`}
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
    theme: PropTypes.oneOf(["dark", "light"]).isRequired,
};