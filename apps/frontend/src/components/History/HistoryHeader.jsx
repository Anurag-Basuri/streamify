import PropTypes from 'prop-types';
import { FaClock } from "react-icons/fa";

export const HistoryHeader = ({ count, onClearAll }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-400/20 rounded-xl">
                <FaClock className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-indigo-400">
                    Viewing History
                </h1>
                <p className="text-gray-400 mt-1">
                    {count} watched items
                </p>
            </div>
        </div>
        <button
            onClick={onClearAll}
            className="bg-rose-500/90 hover:bg-rose-400 text-white px-4 py-2.5 rounded-xl transition-colors"
        >
            Clear All
        </button>
    </div>
);

HistoryHeader.propTypes = {
    count: PropTypes.number.isRequired,
    onClearAll: PropTypes.func.isRequired
};