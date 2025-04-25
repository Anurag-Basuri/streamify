import PropTypes from 'prop-types';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

export const VideoHeader = ({ videoCount, publishedCount }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
                <VideoCameraIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Videos</h1>
                <p className="text-gray-500">
                    {videoCount} videos • {publishedCount} published
                </p>
            </div>
        </div>
    </div>
);

VideoHeader.propTypes = {
    videoCount: PropTypes.number.isRequired,
    publishedCount: PropTypes.number.isRequired
};