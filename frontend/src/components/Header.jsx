import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulating login state

  return (
    <header className="shadow sticky z-50 top-0 bg-white">
      <nav className="flex justify-between items-center mx-auto max-w-screen-xl px-4 py-2">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-x-4">
          {/* Hamburger Menu Icon */}
          <i
            className="fa fa-bars text-gray-700 cursor-pointer text-2xl md:hidden"
            aria-hidden="true"
          ></i>

          {/* Logo Section */}
          <div className="flex items-center gap-x-2">
            {/* SVG Logo */}
            <svg
              className="w-8 h-8 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              imageRendering="optimizeQuality"
              fillRule="evenodd"
              clipRule="evenodd"
              viewBox="0 0 512 512"
              aria-labelledby="logo-title"
              role="img"
            >
              <title id="logo-title">Streamify Logo</title>
              <circle fill="#01A437" cx="256" cy="256" r="256" />
              <path
                fill="#42C76E"
                d="M256 9.28c136.12 0 246.46 110.35 246.46 246.46 0 3.22-.08 6.42-.21 9.62C497.2 133.7 388.89 28.51 256 28.51S14.8 133.7 9.75 265.36c-.13-3.2-.21-6.4-.21-9.62C9.54 119.63 119.88 9.28 256 9.28z"
              />
              <path
                fill="#fff"
                d="M351.74 275.46c17.09-11.03 17.04-23.32 0-33.09l-133.52-97.7c-13.92-8.73-28.44-3.6-28.05 14.57l.54 191.94c1.2 19.71 12.44 25.12 29.04 16l131.99-91.72z"
              />
            </svg>

            {/* Logo Text */}
            <h1 className="text-lg font-bold text-gray-800">streamify</h1>
          </div>
        </div>

        {/* Middle Section - Search Bar */}
        <div className="flex-grow mx-4 hidden md:flex">
          <input
            type="text"
            placeholder="Search for videos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Right Section - Login/Signup or Profile */}
        <div className="flex items-center gap-x-4">
          {/* Show Search Icon for Mobile */}
          <i className="fa fa-search text-gray-700 text-lg md:hidden"></i>

          {isLoggedIn ? (
            <div className="flex items-center gap-x-4">
              {/* Profile Button */}
              <NavLink
                to="/profile"
                className="flex items-center gap-x-2 text-gray-800 hover:text-green-600"
              >
                <i className="fa fa-user-circle text-2xl"></i>
                <span className="hidden md:inline">Profile</span>
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-x-4">
              {/* Login Button */}
              <Link
                to="/login"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Login
              </Link>
              {/* Signup Button */}
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
