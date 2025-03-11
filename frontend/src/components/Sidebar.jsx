import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
};

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <>
            <motion.nav
                variants={sidebarVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-y-0 z-40 w-64 bg-gray-900 shadow-2xl border-r border-gray-700 md:static md:translate-x-0"
                aria-label="Main navigation"
            >
                <div className="h-full flex flex-col p-4 overflow-y-auto">
                    <div className="md:hidden absolute top-4 right-4">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-300 hover:text-purple-400 p-2 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* You section */}
                    <SidebarSection title="You">
                        <NavItem to="/" icon={Home} label="Home" />
                        <NavItem to="/tweet" icon={Twitter} label="Tweet" />
                        <NavItem
                            to="/subscription"
                            icon={Bell} // Updated to Bell
                            label="Subscription"
                        />
                    </SidebarSection>

                    {/* Library Section */}
                    <SidebarSection title="Library">
                        <NavItem to="/history" icon={History} label="History" />
                        <NavItem
                            to="/playlist"
                            icon={ListVideo}
                            label="Playlists"
                        />
                        <NavItem
                            to="/watchlater"
                            icon={Clock}
                            label="Watch Later"
                        />
                        <NavItem
                            to="/downloads"
                            icon={Download}
                            label="Downloads"
                        />
                    </SidebarSection>

                    {/* Account Section */}
                    <SidebarSection title="Account">
                        <NavItem to="/profile" icon={User} label="Profile" />
                        <NavItem
                            to="/more"
                            icon={MoreHorizontal}
                            label="More"
                        />
                    </SidebarSection>
                </div>
            </motion.nav>

            {/* Overlay for mobile only */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

const SidebarSection = ({ title, children }) => (
    <div className="mt-6">
        <h2 className="text-gray-400 uppercase text-xs font-medium mb-2 px-3">
            {title}
        </h2>
        <nav className="space-y-1" aria-label={title}>
            {children}
        </nav>
    </div>
);

const NavItem = ({ to, icon: Icon, label }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="focus-within:outline-none"
    >
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    isActive
                        ? "bg-gray-800 text-purple-400 shadow-md"
                        : "text-gray-300 hover:bg-gray-800"
                }`
            }
            end
        >
            <Icon aria-hidden="true" size={20} className="min-w-[20px]" />
            <span className="ml-3 text-sm">{label}</span>
        </NavLink>
    </motion.div>
);

// Prop type validation
Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
};

SidebarSection.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
};

export default Sidebar;