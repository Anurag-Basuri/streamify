import { Link, NavLink } from "react-router-dom";
import { Menu, X, Search, Bell, User } from "lucide-react";
import { AuthContext } from "../services/AuthContext.jsx";

const Header = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <header className="bg-dark-900 border-b border-dark-700 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                                Streamify
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `text-sm font-medium hover:text-primary-500 transition-colors ${
                                    isActive
                                        ? "text-primary-500"
                                        : "text-gray-300"
                                }`
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/trending"
                            className={({ isActive }) =>
                                `text-sm font-medium hover:text-primary-500 transition-colors ${
                                    isActive
                                        ? "text-primary-500"
                                        : "text-gray-300"
                                }`
                            }
                        >
                            Trending
                        </NavLink>
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-300 hover:text-primary-500">
                            <Search size={20} />
                        </button>

                        {isAuthenticated ? (
                            <>
                                <button className="p-2 text-gray-300 hover:text-primary-500 relative">
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-secondary-500 rounded-full"></span>
                                </button>

                                <div className="relative group">
                                    <button className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center border-2 border-primary-500">
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
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        <div className="p-4 border-b border-dark-700">
                                            <p className="text-sm font-medium text-gray-200 truncate">
                                                {user?.username || "User"}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                to="/profile"
                                                className="block px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 rounded-md"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 rounded-md"
                                            >
                                                Settings
                                            </Link>
                                            <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-dark-700 rounded-md">
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-3">
                                <Link
                                    to="/auth/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary-500"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth/register"
                                    className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;