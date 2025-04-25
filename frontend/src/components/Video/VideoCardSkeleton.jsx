export const VideoCardSkeleton = () => (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
        <div className="aspect-video bg-gray-700" />
        <div className="p-4">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                <div className="h-4 bg-gray-700 rounded w-1/4" />
            </div>
        </div>
    </div>
);