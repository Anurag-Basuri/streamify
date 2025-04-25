import PropTypes from 'prop-types';

export const VideoInfo = ({ video }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-white truncate">
                {video.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
                <img
                    src={video.owner.avatar}
                    alt={video.owner.username}
                    className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-400">
                    {video.owner.username}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">
                    {video.views} views
                </span>
            </div>
        </div>
    );
};

VideoInfo.propTypes = {
    video: PropTypes.shape({
        title: PropTypes.string.isRequired,
        owner: PropTypes.shape({
            avatar: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
        }).isRequired,
        views: PropTypes.number.isRequired,
    }).isRequired,
};