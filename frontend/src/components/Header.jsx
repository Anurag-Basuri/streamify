/**
 * Header Component
 * Modern, glassmorphic header with search, notifications, and auth
 */
import { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    Bell,
    User,
    Search,
    LogOut,
    Settings,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth.js";
import useTheme from "../hooks/useTheme.js";
import { LogoIcon } from "./Logo.jsx";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.15 },
    },
};

const iconButtonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

// ============================================================================
// ICON BUTTON COMPONENT
// ============================================================================

const IconButton = ({ icon: Icon, label, onClick, badge, className = "" }) => (
    <motion.button
        variants={iconButtonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onClick}
        className={`
            relative p-2.5 rounded-xl
            bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]
            ${className}
        `}
        aria-label={label}
    >
        <Icon size={20} strokeWidth={2} />
        {badge && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
            </span>
        )}
    </motion.button>
);

IconButton.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    badge: PropTypes.number,
    className: PropTypes.string,
};

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch?.(query);
        }
    };

    // Keyboard shortcut (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-4">
            <motion.div
                animate={{
                    boxShadow: isFocused
                        ? "0 0 0 2px var(--brand-primary)"
                        : "0 0 0 0px transparent",
                }}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl
                    bg-[var(--input-bg)] border border-[var(--input-border)]
                    transition-colors duration-200
                    ${
                        isFocused
                            ? "border-transparent"
                            : "hover:border-[var(--border-default)]"
                    }
                `}
            >
                <Search
                    size={18}
                    className="text-[var(--text-tertiary)] flex-shrink-0"
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search videos, channels..."
                    className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </motion.div>
        </form>
    );
};

SearchBar.propTypes = {
    onSearch: PropTypes.func,
};

// ============================================================================
// PROFILE DROPDOWN COMPONENT
// ============================================================================

const ProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { icon: User, label: "Profile", to: "/profile" },
        { icon: Settings, label: "Settings", to: "/settings" },
    ];

    return (
        <div ref={dropdownRef} className="relative">
            <motion.button
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 p-1.5 pr-3 rounded-xl
                    bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]
                    transition-colors duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]
                `}
                aria-label="User menu"
                aria-expanded={isOpen}
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0) ||
                        user?.userName?.charAt(0) ||
                        "U"}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-[var(--text-tertiary)] transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-56 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)] shadow-xl z-50"
                    >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-[var(--divider)]">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {user?.fullName || user?.userName}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] truncate">
                                @{user?.userName}
                            </p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.to}
                                    onClick={() => {
                                        navigate(item.to);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Logout */}
                        <div className="pt-1 border-t border-[var(--divider)]">
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ProfileDropdown.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
};

// ============================================================================
// AUTH BUTTONS COMPONENT
// ============================================================================

const AuthButtons = () => (
    <div className="flex items-center gap-2">
        <Link
            to="/auth?mode=login"
            className="hidden sm:block px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
            Sign In
        </Link>
        <Link
            to="/auth?mode=signup"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-xl hover:shadow-lg hover:shadow-[var(--brand-primary)]/25 transition-all duration-200"
        >
            <Sparkles size={14} />
            <span>Get Started</span>
        </Link>
    </div>
);

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { pathname } = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (query) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 h-16 px-4 
                bg-[var(--header-bg)] border-b border-[var(--header-border)]
                backdrop-blur-xl transition-colors duration-300"
        >
            <div className="h-full max-w-[1800px] mx-auto flex items-center justify-between gap-4">
                {/* Left section */}
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <motion.button
                        variants={iconButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={toggleSidebar}
                        className="lg:hidden p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                    >
                        <AnimatePresence mode="wait">
                            {isSidebarOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                >
                                    <X size={20} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                >
                                    <Menu size={20} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <LogoIcon />
                    </Link>
                </div>

                {/* Center - Search */}
                <SearchBar onSearch={handleSearch} />

                {/* Right section */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <IconButton
                                icon={Bell}
                                label="Notifications"
                                badge={3}
                            />
                            <ProfileDropdown user={user} onLogout={logout} />
                        </>
                    ) : (
                        <AuthButtons />
                    )}
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    toggleSidebar: PropTypes.func.isRequired,
    isSidebarOpen: PropTypes.bool.isRequired,
};

export default Header;
