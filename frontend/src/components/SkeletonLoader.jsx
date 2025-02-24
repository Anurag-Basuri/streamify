export default function SkeletonLoader() {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
        <div className="h-48 bg-gray-700" />
        <div className="p-4">
          <div className="h-6 bg-gray-700 rounded mb-2 w-3/4" />
          <div className="h-4 bg-gray-700 rounded mb-4 w-1/2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded-full" />
              <div className="h-4 bg-gray-700 rounded w-16" />
            </div>
            <div className="h-4 bg-gray-700 rounded w-12" />
          </div>
        </div>
      </div>
    );
  }