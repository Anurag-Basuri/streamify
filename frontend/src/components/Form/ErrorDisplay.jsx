import PropTypes from "prop-types";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const ErrorDisplay = ({ error }) => {
    if (!error) return null;

    return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <p>{error}</p>
            </div>
        </div>
    );
};

ErrorDisplay.propTypes = {
    error: PropTypes.string,
};