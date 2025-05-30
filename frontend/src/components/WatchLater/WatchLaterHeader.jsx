import PropTypes from "prop-types";
import { ClockIcon } from "@heroicons/react/24/outline";

// Inline FilterSelect with improved UI and theme support
const FilterSelect = ({ value, onChange, options, label }) => (
    <label className="flex flex-col items-start gap-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">
            {label}
        </span>
        <select
            className="rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </label>
);

FilterSelect.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    label: PropTypes.string,
};

const WatchLaterHeader = ({
    videoCount,
    filter,
    setFilter,
    sortBy,
    setSortBy,
}) => (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-4 mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-xl shadow-lg flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    Watch Later
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {videoCount} saved video{videoCount !== 1 ? "s" : ""}
                </p>
            </div>
        </div>
        <div className="flex gap-3 ml-0 md:ml-auto w-full md:w-auto">
            <FilterSelect
                value={filter}
                onChange={setFilter}
                label="Filter"
                options={[
                    { value: "all", label: "All" },
                    { value: "today", label: "Added Today" },
                    { value: "week", label: "This Week" },
                ]}
            />
            <FilterSelect
                value={sortBy}
                onChange={setSortBy}
                label="Sort"
                options={[{ value: "recent", label: "Recently Added" }]}
            />
        </div>
    </div>
);

WatchLaterHeader.propTypes = {
    videoCount: PropTypes.number.isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    sortBy: PropTypes.string.isRequired,
    setSortBy: PropTypes.func.isRequired
};

export default WatchLaterHeader;