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
            } md:static md:translate-x-0 md:w-20 md:hover:w-64`}
        >
            <div className="h-full flex flex-col bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 shadow-xl md:w-20 md:hover:w-64 transition-all duration-300 group overflow-y-auto">
                {/* Mobile Toggle Button */}
                <div className="p-4 flex items-center justify-between border-b border-gray-700 md:hidden">
                    <span className="text-orange-400 font-medium">
                        StreamIfy
                    </span>
                    <button
                        onClick={toggleSidebar}
                        className="text-orange-400 hover:text-orange-300 transition-colors"
                        aria-label="Close menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Desktop Toggle Button */}
                <div className="hidden md:flex items-center justify-end p-4 border-b border-gray-700">
                    <button
                        onClick={toggleSidebar}
                        className="text-orange-400 hover:text-orange-300 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col gap-4 p-2 overflow-y-auto">
                    {/* Navigation Section */}
                    <div className="space-y-1">
                        <h2 className="text-gray-400 uppercase text-xs font-medium mb-2 px-3 opacity-0 md:group-hover:opacity-100 transition-opacity delay-150">
                            Navigation
                        </h2>
                        <NavItem
                            to="/"
                            icon={Home}
                            label="Home"
                            toggle={toggleSidebar}
                        />
                        <NavItem
                            to="/tweet"
                            icon={Twitter}
                            label="Tweet"
                            toggle={toggleSidebar}
                        />
                        <NavItem
                            to="/subscription"
                            icon={Bell}
                            label="Subscriptions"
                            toggle={toggleSidebar}
                        />
                    </div>

                    {/* Library Section */}
                    <div className="space-y-1">
                        <h2 className="text-gray-400 uppercase text-xs font-medium mb-2 px-3 opacity-0 md:group-hover:opacity-100 transition-opacity delay-150">
                            Library
                        </h2>
                        <NavItem
                            to="/history"
                            icon={History}
                            label="History"
                            toggle={toggleSidebar}
                        />
                        <NavItem
                            to="/playlist"
                            icon={ListVideo}
                            label="Playlists"
                            toggle={toggleSidebar}
                        />
                        <NavItem
                            to="/watchlater"
                            icon={Clock}
                            label="Watch Later"
                            toggle={toggleSidebar}
                        />
                        <NavItem
                            to="/downloads"
                            icon={Download}
                            label="Downloads"
                            toggle={toggleSidebar}
                        />
                    </div>

                    {/* Account Section */}
                    <div className="space-y-1 mt-auto">
                        <h2 className="text-gray-400 uppercase text-xs font-medium mb-2 px-3 opacity-0 md:group-hover:opacity-100 transition-opacity delay-150">
                            Account
                        </h2>
                        <NavItem
                            to="/profile"
                            icon={User}
                            label="Profile"
                            toggle={toggleSidebar}
                        />
                        <NavItem
                            to="/more"
                            icon={MoreHorizontal}
                            label="More"
                            toggle={toggleSidebar}
                        />
                    </div>
                </nav>
            </div>
        </div>
    );
}

// Reusable NavItem component
const NavItem = ({ to, icon: Icon, label, toggle }) => (
    <NavLink
        to={to}
        onClick={toggle}
        className={({ isActive }) =>
            `flex items-center p-3 rounded-lg transition-all 
            hover:bg-gray-800/40 hover:text-orange-300 
            group-[.collapsed]:justify-center md:justify-center md:group-hover:justify-start 
            ${
                isActive
                    ? "bg-gray-800/60 text-orange-400 font-medium"
                    : "text-gray-300"
            }`
        }
    >
        <Icon
            size={20}
            className="min-w-[20px] transition-transform group-hover:scale-110"
        />
        <span className="ml-3 text-sm opacity-0 md:group-hover:opacity-100 transition-opacity delay-150 truncate">
            {label}
        </span>
    </NavLink>
);

export default Sidebar;
