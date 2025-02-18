import { NavLink } from "react-router-dom";
import {
    Home,
    Twitter,
    Bell,
    History,
    Download,
    ListVideo,
    Clock,
    User,
    MoreHorizontal,
    Menu,
} from "lucide-react";

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div
            className={`fixed inset-y-0 z-40 transform transition-all duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 md:w-20 md:hover:w-64`}
        >
            <div className="h-full w-64 bg-gray-900 text-white shadow-xl md:w-20 md:hover:w-64 transition-all duration-300 group overflow-y-auto">
                {/* Sidebar Toggle Button (Visible on Mobile) */}
                <div className="p-4 flex items-center justify-end">
                    <button
                        onClick={toggleSidebar}
                        className="block md:hidden text-orange-400 hover:text-orange-300"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <nav className="mt-4">
                    {/* Display Section */}
                    <div className="p-2">
                        <h2 className="text-gray-400 uppercase text-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            Display
                        </h2>
                        <ul>
                            <li>
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer ${
                                            isActive ? "bg-gray-700" : ""
                                        }`
                                    }
                                    onClick={toggleSidebar}
                                >
                                    <Home size={20} />
                                    <span className="ml-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        Home
                                    </span>
                                </NavLink>
                            </li>
                            {/* Repeat for other items */}
                        </ul>
                    </div>

                    {/* Account Section */}
                    <div className="p-2 mt-4">
                        <h2 className="text-gray-400 uppercase text-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            Account
                        </h2>
                        <ul>
                            <li>
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) =>
                                        `flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer ${
                                            isActive ? "bg-gray-700" : ""
                                        }`
                                    }
                                    onClick={toggleSidebar}
                                >
                                    <User size={20} />
                                    <span className="ml-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        Profile
                                    </span>
                                </NavLink>
                            </li>
                            {/* Repeat for other items */}
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;
