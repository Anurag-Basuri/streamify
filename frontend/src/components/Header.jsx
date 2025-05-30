import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, X, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from 'prop-types';
import useAuth from "../hooks/useAuth.js";
import useTheme from "../hooks/useTheme.js";

// Import components
import { Logo } from "./Logo.jsx";
import { SearchBar } from "./SearchBar.jsx";

// Notification Bell Component
const NotificationBell = ({ theme }) => (
    <button
        className={`p-2 rounded-lg ${
            theme === "dark"
                ? "text-gray-300 hover:text-purple-400"
                : "text-gray-600 hover:text-purple-600"
        } transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400`}
        aria-label="Notifications"
    >
        <Bell className="w-6 h-6" />
    </button>
);

// Profile Dropdown Component
const ProfileDropdown = ({ user, theme, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg ${
                    theme === "dark"
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-gray-600 hover:text-purple-600"
                } transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400`}
                aria-label="User menu"
            >
                <User className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${
                            theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                    >
                        <Link
                            to="/profile"
                            className={`block px-4 py-2 text-sm ${
                                theme === "dark"
                                    ? "text-gray-300 hover:bg-gray-700"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Profile
                        </Link>
                        <button
                            onClick={onLogout}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                                theme === "dark"
                                    ? "text-gray-300 hover:bg-gray-700"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Sign out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { pathname } = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [showTrending, setShowTrending] = useState(false);

    const trendingTopics = [
        "#StreamifyUpdate",
        "Tech Trends 2024",
        "Music Videos",
        "Live Gaming",
    ];

    const isTweetPage = pathname.startsWith("/tweet");

    const handleSearch = (e) => {
        e.preventDefault();
        // Add search functionality here
        console.log(
            `Searching ${isTweetPage ? "tweets" : "videos"} for: ${searchQuery}`
        );
    };

    return (
        <header
            className={`fixed w-full top-0 z-50 ${
                theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
            } border-b shadow-lg`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className={`md:hidden ${
                                theme === "dark"
                                    ? "text-gray-300 hover:text-purple-400"
                                    : "text-gray-600 hover:text-purple-600"
                            } p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400`}
                            aria-label={
                                isSidebarOpen ? "Close Sidebar" : "Open Sidebar"
                            }
                        >
                            {isSidebarOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                        <Logo theme={theme} />
                    </div>

                    {/* Center Section - Search Bar */}
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        showTrending={showTrending}
                        setShowTrending={setShowTrending}
                        trendingTopics={trendingTopics}
                        handleSearch={handleSearch}
                        isTweetPage={isTweetPage}
                        theme={theme}
                    />

                    {/* Right Section - Auth State */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {!isAuthenticated ? (
                            <AuthButtons theme={theme} />
                        ) : (
                            <>
                                <NotificationBell theme={theme} />
                                <ProfileDropdown
                                    user={user}
                                    theme={theme}
                                    onLogout={logout}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const AuthButtons = ({ theme }) => (
    <>
        <Link
            to="/auth?mode=login"
            className={`hidden sm:inline px-3 py-1.5 text-sm ${
                theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-gray-600 hover:text-purple-600"
            } transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg`}
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
);

AuthButtons.propTypes = {
    theme: PropTypes.string.isRequired
};

Header.propTypes = {
    toggleSidebar: PropTypes.func.isRequired,
    isSidebarOpen: PropTypes.bool.isRequired
};

export default Header;
