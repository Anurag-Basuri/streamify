/**
 * Logo Component
 * Adaptive logo using CSS variables for theme support
 */
import { Link } from "react-router-dom";
import useTheme from "../hooks/useTheme";

// Logo without link - for use inside other Links
export const LogoIcon = () => {
    const { isDark } = useTheme();

    return (
        <div className="flex items-center gap-2 group">
            <svg
                className="w-8 h-8 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Base layer */}
                <path
                    d="M15 12L6 16.5V7.5L15 12Z"
                    className="fill-[var(--text-primary)]"
                />
                {/* Middle layer - brand color */}
                <path
                    d="M18 12L9 16.5V7.5L18 12Z"
                    className="fill-[var(--brand-primary)]"
                    fillOpacity="0.7"
                />
                {/* Top layer - lighter brand */}
                <path
                    d="M21 12L12 16.5V7.5L21 12Z"
                    fill={isDark ? "#C4B5FD" : "#A78BFA"}
                    fillOpacity="0.5"
                />
            </svg>
            <span className="hidden sm:inline font-bold text-xl text-[var(--text-primary)] transition-colors">
                Streamify
            </span>
        </div>
    );
};

// Logo with link - for standalone use
export const Logo = () => {
    return (
        <Link to="/" className="flex items-center">
            <LogoIcon />
        </Link>
    );
};

export default Logo;
