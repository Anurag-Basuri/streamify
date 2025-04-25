import PropTypes from "prop-types";

export const FilterSelect = ({ value, onChange, options }) => (
    <select
        className="rounded-lg px-2 py-1 border text-gray-700"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    >
        {options.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
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
            label: PropTypes.string.isRequired
        })
    ).isRequired
};