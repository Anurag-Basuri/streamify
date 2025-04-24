import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
    Home,
    Bell,
    Twitter,
    History,
    Download,
    ListVideo,
    Clock,
    User,
    MoreHorizontal,
    X,
    Sun,
    Moon,
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../services/AuthContext.jsx";

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
    const { user } = useContext(AuthContext);
    const [dark, setDark] = useState(true); // simple local toggle for demo

    // Theme toggle handler (replace with global theme logic if needed)
    const handleThemeToggle = () => setDark((d) => !d);

    return (
        <motion.nav
            variants={{
                open: { width: isMobile ? 256 : 240 },
                closed: { width: 72 },
            }}
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`h-full bg-gray-900 shadow-2xl border-r border-gray-700 overflow-hidden relative transition-colors ${dark ? '' : 'bg-white text-gray-900 border-gray-200'}`}
            style={{ height: `calc(100vh - ${isMobile ? 0 : "64px"})` }}
        >
            <div className="h-full flex flex-col p-2 overflow-y-auto">
                {isMobile && (
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-300 hover:text-purple-400 p-2 rounded-lg"
                            aria-label="Close Sidebar"
                        >
                            <X size={24} />
                        </button>
                    </div>
                )}

                {/* User Avatar & Name */}
                <div className="flex items-center gap-3 mb-6 mt-2 px-2">
                    <img
                        src={user?.avatar || "/default-avatar.png"}
                        alt={user?.userName || "User"}
                        className="w-10 h-10 rounded-full border-2 border-purple-500 shadow"
                    />
                    {isOpen && (
                        <div className="flex flex-col">
                            <span className="font-semibold text-white truncate max-w-[120px]">{user?.userName || "Guest"}</span>
                            <span className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email || ""}</span>
                        </div>
                    )}
                </div>
                <div className="border-b border-gray-700 mb-2" />

                <div className="flex-1">
                    <SidebarSection title="You" isOpen={isOpen}>
                        <NavItem
                            to="/"
                            icon={Home}
                            label="Home"
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/tweet"
                            icon={Twitter}
                            label="Tweet"
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/subscription"
                            icon={Bell}
                            label="Subscription"
                            isOpen={isOpen}
                        />
                    </SidebarSection>

                    <SidebarSection title="Library" isOpen={isOpen}>
                        <NavItem
                            to="/history"
                            icon={History}
                            label="History"
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/playlist"
                            icon={ListVideo}
                            label="Playlists"
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/watchlater"
                            icon={Clock}
                            label="Watch Later"
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/downloads"
                            icon={Download}
                            label="Downloads"
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/create"
                            icon={Download}
                            label="Create"
                            isOpen={isOpen}
                        />
                    </SidebarSection>
                </div>

                <div className="border-t border-gray-700 mt-2 mb-2" />
                <SidebarSection title="Account" isOpen={isOpen}>
                    <NavItem
                        to="/profile"
                        icon={User}
                        label="Profile"
                        isOpen={isOpen}
                    />
                    <NavItem
                        to="/more"
                        icon={MoreHorizontal}
                        label="More"
                        isOpen={isOpen}
                    />
                </SidebarSection>

                {/* Theme Toggle & Pin/Unpin */}
                <div className="flex items-center gap-2 px-2 mt-6 mb-2">
                    <button
                        className="p-2 rounded-full hover:bg-gray-800/60 transition-colors text-yellow-400"
                        title="Toggle theme"
                        onClick={handleThemeToggle}
                    >
                        {dark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {isOpen && <span className="text-xs text-gray-400">{dark ? "Dark" : "Light"} Mode</span>}
                </div>
            </div>
        </motion.nav>
    );
}

function SidebarSection({ title, children, isOpen }) {
    return (
        <div className="mb-2">
            {isOpen && <div className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">{title}</div>}
            <div>{children}</div>
        </div>
    );
}

function NavItem({ to, icon: Icon, label, isOpen }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 my-1 rounded-lg transition-all group relative
                ${isActive ? 'bg-purple-700/80 text-white font-semibold shadow-lg' : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
                ${!isOpen ? 'justify-center' : ''}`
            }
            tabIndex={0}
            aria-label={label}
        >
            <Icon size={22} className="shrink-0" />
            {isOpen && <span className="truncate">{label}</span>}
            {!isOpen && (
                <span className="absolute left-full ml-2 bg-gray-800 text-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none text-xs min-w-max">
                    {label}
                </span>
            )}
        </NavLink>
    );
}

// Prop type validation
Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
};

export default Sidebar;