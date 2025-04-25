import { Link } from "react-router-dom";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import emptyStateIllustration from "../../resources/watch-later-empty.svg";

export const EmptyState = () => (
    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
        <img
            src={emptyStateIllustration}
            alt="Empty watch later"
            className="w-64 mx-auto mb-8"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Time Capsule Awaits
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
            Save videos you want to watch later and they&apos;ll appear here.
            Curate your perfect viewing experience!
        </p>
        <Link
            to="/videos"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl 
            hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg"
        >
            <PlayCircleIcon className="w-5 h-5" />
            Explore Trending Videos
        </Link>
    </div>
);