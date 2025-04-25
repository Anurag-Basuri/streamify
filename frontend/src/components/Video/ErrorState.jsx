import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

export const ErrorState = ({ error, onRetry }) => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            )}
        </div>
    </div>
);

ErrorState.propTypes = {
    error: PropTypes.string.isRequired,
    onRetry: PropTypes.func
};