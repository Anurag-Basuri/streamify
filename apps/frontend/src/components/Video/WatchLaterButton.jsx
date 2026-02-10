import PropTypes from 'prop-types';
import { FaClock } from 'react-icons/fa';

export const WatchLaterButton = ({ inWatchLater, loading, onClick }) => {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50"
        >
            <FaClock 
                className={`w-5 h-5 ${inWatchLater ? "text-purple-500" : ""}`} 
            />
        </button>
    );
};

WatchLaterButton.propTypes = {
    inWatchLater: PropTypes.bool,
    loading: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};