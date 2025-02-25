import { useContext, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Menu, X, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../services/AuthContext.jsx";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { pathname } = useLocation();
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [showTrending, setShowTrending] = useState(false);

    const [trendingTopics] = useState([
        "#StreamifyUpdate",
        "Tech Trends 2024",
        "Music Videos",
        "Live Gaming",
    ]);

    const isTweetPage = pathname.includes("/tweet");

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(
            isTweetPage
                ? `Searching tweets for: ${searchQuery}`
                : `Searching videos for: ${searchQuery}`
        );
    };

    return (
        <header className="bg-gray-900 border-b border-gray-700 fixed w-full top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    {/* Left Section - Menu, Logo, Brand Name */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-300 hover:text-purple-400 p-2 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>

                        {/* Wrap the logo in a Link */}
                        <Link to="/" className="flex items-center gap-2">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 100 100"
                                fill="none"
                                className="shrink-0"
                            >
                                <defs>
                                    <linearGradient
                                        id="gradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#ff6b6b" />
                                        <stop
                                            offset="100%"
                                            stopColor="#6b6bff"
                                        />
                                    </linearGradient>
                                </defs>
                                <polygon
                                    points="35,25 70,50 35,75"
                                    fill="url(#gradient)"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M15 50 Q25 30, 35 50 T55 50"
                                    stroke="url(#gradient)"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M10 50 Q20 20, 35 50 T60 50"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity="0.6"
                                />
                            </svg>
                            <span className="text-white font-bold text-xl">
                                Streamify
                            </span>
                        </Link>
                    </div>

                    {/* Center Section - Search Bar */}
                    <div className="flex-1 flex justify-center mx-4 max-w-2xl">
                        <motion.form
                            onSubmit={handleSearch}
                            className="w-full relative"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={
                                        isTweetPage
                                            ? "Search Streamify"
                                            : "Search videos, channels..."
                                    }
                                    className={`w-full bg-gray-800 text-gray-200 rounded-full px-6 py-2 pr-12 focus:outline-none focus:ring-2 ${
                                        isTweetPage
                                            ? "focus:ring-blue-400 h-10"
                                            : "focus:ring-purple-400 h-12"
                                    }`}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onFocus={() => setShowTrending(true)}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowTrending(false),
                                            100
                                        )
                                    }
                                />
                                <button
                                    type="submit"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
                                >
                                    <Search size={20} />
                                </button>
                            </div>

                            {/* Trending Suggestions */}
                            {showTrending && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-xl p-4"
                                >
                                    <div className="space-y-3">
                                        <h3 className="text-gray-400 font-medium">
                                            Trending Now
                                        </h3>
                                        {trendingTopics.map((topic, index) => (
                                            <div
                                                key={index}
                                                className="text-gray-200 hover:bg-gray-700 p-2 rounded cursor-pointer"
                                            >
                                                {topic}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.form>
                    </div>

                    {/* Right Section - Auth State */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/auth"
                                    className="px-4 py-2 text-gray-300 hover:text-purple-400 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth"
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:shadow-lg transition-all"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    className="p-2 text-gray-300 hover:text-purple-400 relative transition-all"
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                </motion.button>

                                {/* Profile Dropdown */}
                                <div className="relative group">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-400">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    className="rounded-full"
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <User
                                                    className="text-gray-300"
                                                    size={18}
                                                />
                                            )}
                                        </div>
                                    </motion.button>

                                    <AnimatePresence>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700"
                                        >
                                            <div className="p-4 border-b border-gray-700">
                                                <p className="text-sm font-medium text-gray-200 truncate">
                                                    {user?.username || "User"}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <Link
                                                    to="/profile"
                                                    className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    onClick={logout}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md transition-colors"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;