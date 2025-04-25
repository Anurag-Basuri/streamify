import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
    Home,
    Bell,
    History,
    Clock,
    User,
    X,
    Sun,
    Moon,
    Settings,
    PlusSquare,
    Film,
    ListVideo,
    DownloadCloud,
    ThumbsUp,
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme(); // Use theme context instead of local state
    const [activeHover, setActiveHover] = useState(null);

    const handleMouseEnter = (label) => setActiveHover(label);
    const handleMouseLeave = () => setActiveHover(null);

    const commonLinks = [
        { to: "/", icon: Home, label: "Home" },
        { to: "/trending", icon: ThumbsUp, label: "Trending" },
        { to: "/subscriptions", icon: Bell, label: "Subscriptions" },
    ];

    const authLinks = [
        { to: "/history", icon: History, label: "History" },
        { to: "/playlists", icon: ListVideo, label: "Playlists" },
        { to: "/watch-later", icon: Clock, label: "Watch Later" },
        { to: "/your-videos", icon: Film, label: "Your Videos" },
        { to: "/uploads", icon: PlusSquare, label: "Upload Video" },
        { to: "/downloads", icon: DownloadCloud, label: "Downloads" },
    ];

    const accountLinks = [
        { to: "/profile", icon: User, label: "Profile" },
        { to: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <motion.nav
            initial={false}
            animate={{
                width: isOpen ? (isMobile ? "100%" : "240px") : "72px",
                opacity: 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`h-full bg-background shadow-xl border-r border-border overflow-hidden relative`}
            style={{ height: `calc(100vh - ${isMobile ? 0 : "64px"})` }}
            aria-label="Main navigation"
        >
            <div className="h-full flex flex-col p-2 overflow-y-auto">
                {isMobile && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-accent text-foreground"
                            aria-label="Close sidebar"
                        >
                            <X size={24} aria-hidden="true" />
                        </button>
                    </div>
                )}

                <div className="flex-1">
                    {/* Main Navigation */}
                    <SidebarSection isOpen={isOpen}>
                        {commonLinks.map((link) => (
                            <NavItem
                                key={link.to}
                                {...link}
                                isOpen={isOpen}
                                onHover={handleMouseEnter}
                                onLeave={handleMouseLeave}
                                isActive={activeHover === link.label}
                            />
                        ))}
                    </SidebarSection>

                    {/* Authenticated User Section */}
                    {isAuthenticated && (
                        <SidebarSection title="Library" isOpen={isOpen}>
                            {authLinks.map((link) => (
                                <NavItem
                                    key={link.to}
                                    {...link}
                                    isOpen={isOpen}
                                    onHover={handleMouseEnter}
                                    onLeave={handleMouseLeave}
                                    isActive={activeHover === link.label}
                                />
                            ))}
                        </SidebarSection>
                    )}

                    {/* Account Section */}
                    <SidebarSection title="Account" isOpen={isOpen}>
                        {accountLinks.map((link) => (
                            <NavItem
                                key={link.to}
                                {...link}
                                isOpen={isOpen}
                                onHover={handleMouseEnter}
                                onLeave={handleMouseLeave}
                                isActive={activeHover === link.label}
                            />
                        ))}
                    </SidebarSection>
                </div>

                {/* Theme Toggle */}
                <div className="border-t border-border mt-auto pt-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                        aria-label={`Toggle ${
                            theme === "dark" ? "light" : "dark"
                        } theme`}
                    >
                        {theme === "dark" ? (
                            <Sun size={20} aria-hidden="true" />
                        ) : (
                            <Moon size={20} aria-hidden="true" />
                        )}
                        {isOpen && (
                            <span className="text-sm">
                                {theme === "dark"
                                    ? "Light Theme"
                                    : "Dark Theme"}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

const SidebarSection = ({ title, children, isOpen }) => (
    <div className="mb-4">
        {isOpen && title && (
            <h3 className="px-3 py-2 text-xs font-medium uppercase text-muted-foreground tracking-wider">
                {title}
            </h3>
        )}
        <div className="space-y-1">{children}</div>
    </div>
);

const NavItem = ({
    to,
    icon: Icon,
    label,
    isOpen,
    onHover,
    onLeave,
    isActive,
}) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
      ${
          isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent text-foreground"
      }
      ${isOpen ? "w-full" : "w-[56px] justify-center"}`
        }
        onMouseEnter={() => onHover(label)}
        onMouseLeave={onLeave}
        onFocus={() => onHover(label)}
        onBlur={onLeave}
        aria-current={isActive ? "page" : undefined}
    >
        <Icon size={20} aria-hidden="true" />
        {isOpen && <span className="text-sm truncate">{label}</span>}

        {!isOpen && (
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
                className="absolute left-full ml-2 bg-popover text-popover-foreground px-2 py-1 rounded-md shadow-lg text-sm whitespace-nowrap"
            >
                {label}
            </motion.span>
        )}
    </NavLink>
);

// Prop type validation
Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
};

SidebarSection.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
};

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    onHover: PropTypes.func,
    onLeave: PropTypes.func,
    isActive: PropTypes.bool,
};

export default Sidebar;