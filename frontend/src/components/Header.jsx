import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Added for mobile menu toggle

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
            <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
                {/* Left Section */}
                <div className="flex items-center gap-x-4">
                    {/* Hamburger Menu (For future implementation) */}
                    <button
                        aria-label="Open menu"
                        className="text-orange-400 hover:text-orange-300 md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle mobile menu
                    >
                        <i
                            className="fa fa-bars text-xl"
                            aria-hidden="true"
                        ></i>
                    </button>

                    {/* Mobile Menu (Future implementation) */}
                    {isMenuOpen && (
                        <div className="mobile-menu absolute top-0 left-0 bg-gray-800 w-full h-screen flex flex-col items-center justify-center">
                            {/* Add menu items here */}
                            <NavLink
                                to="/profile"
                                className="text-white py-2"
                                onClick={() => setIsMenuOpen(false)} // Close the menu on item click
                            >
                                Profile
                            </NavLink>
                            <Link
                                to="/auth"
                                className="text-white py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/auth"
                                className="text-white py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Logo */}
                    <NavLink
                        to="/"
                        className="flex items-center gap-x-2 transition-transform hover:scale-105"
                    >
                        <svg
                            className="h-8 w-8"
                            viewBox="0 0 32 32"
                            aria-labelledby="logo-title"
                            role="img"
                        >
                            <title id="logo-title">Streamify Logo</title>
                            <circle cx="16" cy="16" r="16" fill="#FF6B35" />
                            <circle cx="16" cy="16" r="12.5" fill="#FF914D" />
                            <path
                                fill="#fff"
                                d="M22.8 15.2L13.5 8.1c-.4-.3-.9-.2-1.1.2-.1.2-.2.4-.2.6v14.2c0 .5.4.8.8.8.2 0 .4-.1.5-.2l9.3-7.1c.3-.2.4-.6.2-.9-.1-.3-.4-.4-.7-.4z"
                            />
                        </svg>
                        <span className="text-xl font-bold text-white">
                            Streamify
                        </span>
                    </NavLink>
                </div>

                {/* Middle Section - Search */}
                <div
                    className={`relative mx-4 flex-grow transition-all ${
                        showMobileSearch ? "block" : "hidden md:block"
                    }`}
                >
                    <input
                        type="text"
                        placeholder="Search videos..."
                        className="w-full rounded-lg bg-gray-700 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <i className="fa fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-x-4">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                        className="text-orange-400 hover:text-orange-300 md:hidden"
                        aria-label="Toggle search"
                    >
                        <i className="fa fa-search text-lg"></i>
                    </button>

                    {isLoggedIn ? (
                        <div className="flex items-center gap-x-4">
                            <NavLink
                                to="/profile"
                                className="flex items-center gap-x-2 text-white hover:text-orange-300"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                                    <i className="fa fa-user text-sm"></i>
                                </div>
                                <span className="hidden md:inline font-medium">
                                    Profile
                                </span>
                            </NavLink>
                            <button
                                onClick={() => setIsLoggedIn(false)} // Handle logout
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
