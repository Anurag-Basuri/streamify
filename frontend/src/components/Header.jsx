import { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext.jsx";

function Header() {
    const { user, isLoading, isAuthenticated, logout } =
        useContext(AuthContext);
    const [showSearch, setShowSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (isLoading) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg shadow-lg">
            <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
                {/* Logo & Menu Button */}
                <div className="flex items-center gap-x-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-orange-400 hover:text-orange-300"
                        aria-label="Toggle Menu"
                    >
                        <i className="fa fa-bars text-xl"></i>
                    </button>

                    {/* Logo */}
                    <NavLink
                        to="/"
                        className="flex items-center gap-x-2 transition-transform hover:scale-105"
                    >
                        <svg className="h-8 w-8" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="16" fill="#FF6B35" />
                            <circle cx="16" cy="16" r="12.5" fill="#FF914D" />
                            <path
                                fill="#fff"
                                d="M22.8 15.2L13.5 8.1c-.4-.3-.9-.2-1.1.2-.1.2-.2.4-.2.6v14.2c0 .5.4.8.8.8.2 0 .4-.1.5-.2l9.3-7.1c.3-.2.4-.6.2-.9-.1-.3-.4-.4-.7-.4z"
                            />
                        </svg>
                        <span className="text-xl font-bold text-white">
                            StreamIfy
                        </span>
                    </NavLink>
                </div>

                {/* Search Bar */}
                <div
                    className={`relative mx-4 flex-grow transition-all ${
                        showSearch ? "block" : "hidden md:block"
                    }`}
                >
                    <input
                        type="text"
                        placeholder="Search videos..."
                        className="w-full rounded-lg bg-gray-700 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <i className="fa fa-search absolute left-3 top-3 text-gray-400"></i>

                    {showSearch && (
                        <button
                            onClick={() => setShowSearch(false)}
                            className="absolute right-3 top-2 text-gray-400 hover:text-white"
                            aria-label="Close Search"
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-x-4">
                    {/* Mobile Search Button */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="text-orange-400 hover:text-orange-300 md:hidden"
                        aria-label="Toggle Search"
                    >
                        <i className="fa fa-search text-lg"></i>
                    </button>

                    {/* User Logged In / Logged Out Section */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-x-4">
                            <NavLink
                                to="/profile"
                                className="flex items-center gap-x-2 text-white hover:text-orange-300"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                                    <i className="fa fa-user text-sm"></i>
                                </div>
                                <span className="hidden md:inline font-medium">
                                    {user?.userName || "Profile"}
                                </span>
                            </NavLink>
                            <button
                                onClick={logout}
                                className="rounded-lg px-4 py-2 text-white hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-x-3">
                            <Link
                                to="/auth"
                                className="rounded-lg px-4 py-2 text-white hover:bg-gray-700 hover:text-orange-300"
                            >
                                Login
                            </Link>
                            <Link
                                to="/auth"
                                className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
