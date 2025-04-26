import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const Logo = ({ theme }) => (
    <Link to="/" className="flex items-center gap-2">
        <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M15 12L6 16.5V7.5L15 12Z"
                fill={theme === "dark" ? "#fff" : "#1F2937"}
            />
            <path
                d="M18 12L9 16.5V7.5L18 12Z"
                fill={theme === "dark" ? "#8B5CF6" : "#6D28D9"}
                fillOpacity="0.6"
            />
            <path
                d="M21 12L12 16.5V7.5L21 12Z"
                fill={theme === "dark" ? "#C4B5FD" : "#A78BFA"}
                fillOpacity="0.4"
            />
        </svg>
        <span
            className={`hidden sm:inline font-bold text-xl ${
                theme === "dark" ? "text-white" : "text-gray-900"
            }`}
        >
            Streamify
        </span>
    </Link>
);

Logo.propTypes = {
    theme: PropTypes.oneOf(["dark", "light"]).isRequired
};