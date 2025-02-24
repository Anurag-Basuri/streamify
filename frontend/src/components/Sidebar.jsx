import { NavLink } from "react-router-dom";
import {
    Bell,
    History,
    Download,
    ListVideo,
    Clock,
    User,
    MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 },
};

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <>
            <motion.div
                variants={sidebarVariants}
                animate={isOpen ? "open" : "closed"}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 z-40 w-64 bg-gray-900 shadow-2xl border-r border-gray-700"
            >
                <div className="h-full flex flex-col p-4 overflow-y-auto">
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
            </motion.div>

            {/* Overlay when Sidebar is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
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
        <div className="space-y-1">{children}</div>
    </div>
);

const NavItem = ({ to, icon: Icon, label }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                        ? "bg-gray-800 text-purple-400 shadow-md"
                        : "text-gray-300 hover:bg-gray-800"
                }`
            }
        >
            <Icon size={20} className="min-w-[20px]" />
            <span className="ml-3 text-sm">{label}</span>
        </NavLink>
    </motion.div>
);

export default Sidebar;
