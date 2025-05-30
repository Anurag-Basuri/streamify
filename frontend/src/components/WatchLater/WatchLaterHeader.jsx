import PropTypes from "prop-types";
import { ClockIcon } from "@heroicons/react/24/outline";

// Inline FilterSelect component
const FilterSelect = ({ value, onChange, options }) => (
    <select
        className="rounded-lg px-2 py-1 border text-gray-700"
        value={value}
        onChange={e => onChange(e.target.value)}
    >
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
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
};

const WatchLaterHeader = ({
    videoCount,
    filter,
    setFilter,
    sortBy,
    setSortBy,
}) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <ClockIcon className="w-8 h-8 text-white" />
        </div>
        <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Watch Later
            </h1>
            <p className="text-gray-500 mt-1">
                {videoCount} saved video{videoCount !== 1 ? "s" : ""}
            </p>
        </div>
        <div className="ml-auto flex gap-3">
            <FilterSelect
                value={filter}
                onChange={setFilter}
                options={[
                    { value: "all", label: "All" },
                    { value: "today", label: "Added Today" },
                    { value: "week", label: "This Week" },
                ]}
            />
            <FilterSelect
                value={sortBy}
                onChange={setSortBy}
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