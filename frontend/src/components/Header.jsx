import { useContext } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext.jsx";

function Header({ toggleSidebar }) {
    const { user, isLoading, isAuthenticated, logout } =
        useContext(AuthContext);
    const location = useLocation();

    if (isLoading)
        return (
            <div className="h-16 bg-gradient-to-b from-gray-900 to-gray-800" />
        );

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-700 transition-all duration-300">
            <nav className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-x-4">
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden text-orange-400 hover:text-orange-300 p-1.5 rounded-lg hover:bg-gray-800/40 transition-colors"
                            aria-label="Toggle navigation"
                        >
                            <svg
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        <NavLink
                            to="/"
                            className="flex items-center gap-x-2 transition-transform active:scale-95"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                                <svg
                                    className="h-5 w-5 text-white"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M18.54 9L8.88 3.46a3.42 3.42 0 00-5.13 3v11.12A3.42 3.42 0 007.17 21a3.43 3.43 0 001.71-.46L18.54 15a3.42 3.42 0 000-5.92zM15 12L6.5 7v10L15 12z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent tracking-tight hidden sm:block">
                                StreamIfy
                            </span>
                        </NavLink>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-x-3">
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) =>
                                        `flex items-center gap-x-2 rounded-lg px-3 py-2 transition-colors duration-200 ${
                                            isActive
                                                ? "bg-gray-800/60 ring-2 ring-orange-500/30"
                                                : "hover:bg-gray-800/40"
                                        }`
                                    }
                                >
                                    <div className="relative h-8 w-8">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Profile"
                                                className="rounded-full h-full w-full object-cover border border-gray-600"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : null}
                                        <div className="absolute inset-0 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                            <span className="text-sm font-medium text-orange-400">
                                                {user?.userName?.[0]?.toUpperCase() ||
                                                    "U"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-200 hidden lg:inline">
                                        {user?.userName || "Profile"}
                                    </span>
                                </NavLink>

                                <button
                                    onClick={logout}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/40 hover:bg-gray-800/60 hover:text-orange-400 transition-colors duration-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-x-2">
                                <Link
                                    to="/auth"
                                    state={{ from: location }}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800/40 hover:text-orange-400 transition-colors duration-200"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/auth"
                                    state={{ from: location }}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;