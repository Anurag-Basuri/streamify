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
import { useContext, useState, useEffect } from "react";

const sidebarVariants = {
    open: { width: "240px" },
    closed: { width: "72px" },
};

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
    const [isHovered, setIsHovered] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && !isMobile) {
                setCollapsed(!isOpen);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isOpen, isMobile]);

    return (
        <>
            <motion.nav
                variants={!isMobile && sidebarVariants}
                animate={
                    isMobile
                        ? isOpen
                            ? "open"
                            : "closed"
                        : collapsed
                        ? "closed"
                        : "open"
                }
                transition={{ type: "tween", duration: 0.15 }}
                className={`fixed md:relative inset-y-0 z-40 bg-gray-900 shadow-2xl border-r border-gray-700 ${
                    isMobile ? "w-64" : "w-72"
                }`}
                aria-label="Main navigation"
                onHoverStart={() => !isMobile && setCollapsed(false)}
                onHoverEnd={() => !isMobile && setCollapsed(true)}
            >
                <div className="h-full flex flex-col p-2 overflow-y-auto">
                    {isMobile && (
                        <div className="md:hidden absolute top-4 right-4">
                            <button
                                onClick={toggleSidebar}
                                className="text-gray-300 hover:text-purple-400 p-2 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}

                    <div className="flex-1">
                        <SidebarSection title="You" collapsed={collapsed}>
                            <NavItem
                                to="/"
                                icon={Home}
                                label="Home"
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/tweet"
                                icon={Twitter}
                                label="Tweet"
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/subscription"
                                icon={Bell}
                                label="Subscription"
                                collapsed={collapsed}
                            />
                        </SidebarSection>

                        <SidebarSection title="Library" collapsed={collapsed}>
                            <NavItem
                                to="/history"
                                icon={History}
                                label="History"
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/playlist"
                                icon={ListVideo}
                                label="Playlists"
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/watchlater"
                                icon={Clock}
                                label="Watch Later"
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/downloads"
                                icon={Download}
                                label="Downloads"
                                collapsed={collapsed}
                            />
                        </SidebarSection>
                    </div>

                    <SidebarSection title="Account" collapsed={collapsed}>
                        <NavItem
                            to="/profile"
                            icon={User}
                            label="Profile"
                            collapsed={collapsed}
                        />
                        <NavItem
                            to="/more"
                            icon={MoreHorizontal}
                            label="More"
                            collapsed={collapsed}
                        />
                    </SidebarSection>
                </div>
            </motion.nav>

            {isMobile && (
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
            )}
        </>
    );
}

const SidebarSection = ({ title, children, collapsed }) => (
    <div className="mt-4">
        {!collapsed && (
            <h2 className="text-gray-400 uppercase text-xs font-medium mb-2 px-3">
                {title}
            </h2>
        )}
        <nav className="space-y-1" aria-label={title}>
            {children}
        </nav>
    </div>
);

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="focus-within:outline-none group"
    >
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors mx-2 ${
                    isActive
                        ? "bg-gray-800 text-purple-400 shadow-md"
                        : "text-gray-300 hover:bg-gray-800"
                } ${collapsed ? "justify-center" : ""}`
            }
            end
        >
            <Icon aria-hidden="true" size={20} className="min-w-[20px]" />
            {!collapsed && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 text-sm"
                >
                    {label}
                </motion.span>
            )}
            {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {label}
                </div>
            )}
        </NavLink>
    </motion.div>
);

// Prop type validation
Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
};

SidebarSection.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    collapsed: PropTypes.bool,
};

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    collapsed: PropTypes.bool,
};

export default Sidebar;