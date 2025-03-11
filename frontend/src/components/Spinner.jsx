import PropTypes from 'prop-types';

const Spinner = ({ size = 40, color = '#6366f1' }) => {
    const spinnerStyle = {
        width: size,
        height: size,
        borderColor: color,
    };

    return (
        <div
    role="status"
    aria-label="Loading"
    className="flex justify-center items-center"
>
    <div
        style={spinnerStyle}
        className="animate-spin rounded-full border-t-2 border-b-2 border-transparent"
    />
    <span className="sr-only">Loading...</span>
</div>
    );
};

Spinner.propTypes = {
    size: PropTypes.number,
    color: PropTypes.string,
    className: PropTypes.string,
};

export default Spinner;