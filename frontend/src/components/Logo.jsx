import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const Logo = ({ theme }) => (
    <Link to="/" className="flex items-center gap-2">
        {/* Your existing SVG logo code */}
        <span className={`hidden sm:inline font-bold text-xl ${
            theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
            Streamify
        </span>
    </Link>
);

Logo.propTypes = {
    theme: PropTypes.oneOf(["dark", "light"]).isRequired
};