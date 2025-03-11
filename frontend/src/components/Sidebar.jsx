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
import { useState, useEffect } from "react";

const sidebarVariants = {
    open: { width: "240px" },
    closed: { width: "72px" },
};

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
    const [isHovered, setIsHovered] = useState(false);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && !isMobile) {
                toggleSidebar(false); // Close sidebar on desktop
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobile, toggleSidebar]);

    return (
        <>
            {/* Sidebar */}
            <motion.nav
                variants={!isMobile && sidebarVariants}
                animate={isOpen ? "open" : "closed"}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={`fixed md:relative inset-y-0 z-40 bg-gray-900 shadow-2xl border-r border-gray-700 ${
                    isMobile ? "w-64" : "w-[240px]"
                }`}
                aria-label="Sidebar"
            >
                <div className="h-full flex flex-col p-2 overflow-y-auto">
                    {/* Close Button for Mobile */}
                    {isMobile && (
                        <div className="md:hidden absolute top-4 right-4">
                            <button
                                onClick={toggleSidebar}
                                className="text-gray-300 hover:text-purple-400 p-2 rounded-lg transition-colors"
                                aria-label="Close Sidebar"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}

                    {/* Sidebar Content */}
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
                        </SidebarSection>
                    </div>

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
                </div>
            </motion.nav>

            {/* Mobile Overlay */}
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
                            role="button"
                            aria-label="Close Sidebar"
                        />
                    )}
                </AnimatePresence>
            )}
        </>
    );
}

const SidebarSection = ({ title, children, isOpen }) => (
    <div className="mt-4">
        {isOpen && (
            <h2 className="text-gray-400 uppercase text-xs font-medium mb-2 px-3">
                {title}
            </h2>
        )}
        <nav className="space-y-1" aria-label={title}>
            {children}
        </nav>
    </div>
);

const NavItem = ({ to, icon: Icon, label, isOpen }) => (
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
                } ${!isOpen ? "justify-center" : ""}`
            }
            end
        >
            <Icon aria-hidden="true" size={20} className="min-w-[20px]" />
            {isOpen && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 text-sm"
                >
                    {label}
                </motion.span>
            )}
            {!isOpen && (
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
    isOpen: PropTypes.bool.isRequired,
};

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;