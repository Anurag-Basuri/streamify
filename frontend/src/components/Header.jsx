import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-x-4">
          {/* Hamburger Menu */}
          <button
            aria-label="Open menu"
            className="text-orange-400 hover:text-orange-300 md:hidden"
          >
            <i className="fa fa-bars text-xl" aria-hidden="true"></i>
          </button>

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
              <path
                fill="#FF6B35"
                d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z"
              />
              <path
                fill="#FF914D"
                d="M16 3.5c6.903 0 12.5 5.597 12.5 12.5S22.903 28 16 28 3.5 22.403 3.5 15.5 9.097 3.5 16 3.5z"
              />
              <path
                fill="#fff"
                d="M22.8 15.2L13.5 8.1c-.4-.3-.9-.2-1.1.2-.1.2-.2.4-.2.6v14.2c0 .5.4.8.8.8.2 0 .4-.1.5-.2l9.3-7.1c.3-.2.4-.6.2-.9-.1-.3-.4-.4-.7-.4z"
              />
            </svg>
            <span className="text-xl font-bold text-white">Streamify</span>
          </NavLink>
        </div>

        {/* Middle Section - Search */}
        <div
          className={`mx-4 flex-grow transition-all ${
            showMobileSearch ? "block" : "hidden md:block"
          }`}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full rounded-lg bg-gray-700 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <i className="fa fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
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
                to="/upload"
                className="hidden items-center gap-x-2 text-orange-400 hover:text-orange-300 sm:flex"
              >
                <i className="fa fa-upload text-lg"></i>
                <span className="font-medium">Upload</span>
              </NavLink>
              <NavLink
                to="/profile"
                className="flex items-center gap-x-2 text-white hover:text-orange-300"
              >
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <i className="fa fa-user text-sm"></i>
                </div>
                <span className="hidden font-medium md:inline">Profile</span>
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-x-3">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-white hover:bg-gray-700 hover:text-orange-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
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
