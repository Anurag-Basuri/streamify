import { PlusCircleIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const EmptyState = ({ title, description, actionLabel, onAction }) => (
    <div className="text-center py-12">
        <div className="rounded-full bg-gray-100 p-4 w-20 h-20 mx-auto mb-6">
            <PlusCircleIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            {actionLabel}
        </button>
    </div>
);

EmptyState.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    actionLabel: PropTypes.string.isRequired,
    onAction: PropTypes.func.isRequired
};

export default EmptyState;