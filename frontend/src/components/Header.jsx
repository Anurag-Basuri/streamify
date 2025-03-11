/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Menu, X, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../services/AuthContext.jsx";

const Header = ({ toggleSidebar, isSidebarOpen, sidebarWidth, isMobile }) => {
    const { pathname } = useLocation();
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [showTrending, setShowTrending] = useState(false);

    return (
        <header className="fixed w-full top-0 z-50 bg-gray-900 border-b border-gray-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden text-gray-300 hover:text-purple-400 p-2 rounded-lg"
                            aria-label="Toggle Sidebar"
                        >
                            {isSidebarOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>

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
                            <span className="hidden sm:inline text-white font-bold text-xl">
                                Streamify
                            </span>
                        </Link>
                    </div>

                    {/* Center Section - Search Bar */}
                    <div className="flex-1 max-w-2xl mx-2">
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="relative"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={
                                        isTweetPage
                                            ? "Search Streamify"
                                            : "Search videos, channels..."
                                    }
                                    className={`w-full bg-gray-800 text-gray-200 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                                        isTweetPage
                                            ? "focus:ring-blue-400"
                                            : "focus:ring-purple-400"
                                    } text-sm sm:text-base`}
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full p-1"
                                    aria-label="Search"
                                >
                                    <Search size={18} />
                                </button>
                            </div>

                            {/* Trending Suggestions */}
                            <AnimatePresence>
                                {showTrending && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-xl p-4 max-h-[60vh] overflow-y-auto"
                                    >
                                        <div className="space-y-3">
                                            <h3 className="text-gray-400 font-medium">
                                                Trending Now
                                            </h3>
                                            {trendingTopics.map(
                                                (topic, index) => (
                                                    <div
                                                        key={index}
                                                        className="text-gray-200 hover:bg-gray-700 p-2 rounded cursor-pointer"
                                                    >
                                                        {topic}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>

                    {/* Right Section - Auth State */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/auth?mode=login"
                                    className="hidden sm:inline px-3 py-1.5 text-sm text-gray-300 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth?mode=signup"
                                    className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Notification Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 text-gray-300 hover:text-purple-400 relative transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                </motion.button>

                                {/* Profile Dropdown */}
                                <div className="relative group">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full"
                                        aria-label="Profile Menu"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-400 overflow-hidden">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    className="w-full h-full object-cover"
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

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                            >
                                                Settings
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 focus:outline-none"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
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
