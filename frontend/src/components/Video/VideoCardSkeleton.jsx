/**
 * VideoCardSkeleton
 * Animated skeleton loader with shimmer effect for video cards
 */

export const VideoCardSkeleton = () => (
    <div className="card rounded-xl overflow-hidden">
        {/* Thumbnail Skeleton */}
        <div className="aspect-video skeleton" />

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-4 skeleton rounded w-[85%]" />
            <div className="h-4 skeleton rounded w-[60%]" />

            {/* Channel Info */}
            <div className="flex items-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 skeleton rounded w-[50%]" />
                    <div className="h-3 skeleton rounded w-[30%]" />
                </div>
            </div>
        </div>
    </div>
);

/**
 * VideoCardSkeletonGrid
 * Grid of skeleton cards for loading state
 */
export const VideoCardSkeletonGrid = ({ count = 8 }) => (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: count }, (_, i) => (
            <VideoCardSkeleton key={i} />
        ))}
    </div>
);

export default VideoCardSkeleton;
