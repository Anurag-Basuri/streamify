import PropTypes from 'prop-types';

export const UserStats = ({ stats = {} }) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Tweets" value={stats?.tweetCount || 0} />
        <StatCard title="Videos" value={stats?.videoCount || 0} />
        <StatCard title="Watch Later" value={stats?.watchLaterCount || 0} />
        <StatCard title="Likes" value={stats?.likeCount || 0} />
        <StatCard title="Comments" value={stats?.commentCount || 0} />
    </div>
);

const StatCard = ({ title, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
);

UserStats.propTypes = {
    stats: PropTypes.object
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
};