import PropTypes from 'prop-types';
import { ContentSection } from './ContentSection';
import { TweetItem } from './TweetItem';
import { VideoItem } from './VideoItem';

export const UserContent = ({ content = {} }) => (
    <div className="space-y-8">
        {content?.tweets?.length > 0 && (
            <ContentSection
                title="Recent Tweets"
                items={content.tweets}
                renderItem={(tweet) => <TweetItem key={tweet._id} tweet={tweet} />}
            />
        )}

        {content?.videos?.length > 0 && (
            <ContentSection
                title="Recent Videos"
                items={content.videos}
                renderItem={(video) => <VideoItem key={video._id} video={video} />}
            />
        )}

        {content?.watchLater?.length > 0 && (
            <ContentSection
                title="Watch Later"
                items={content.watchLater}
                renderItem={(video) => <VideoItem key={video._id} video={video} />}
            />
        )}
    </div>
);

UserContent.propTypes = {
    content: PropTypes.object
};