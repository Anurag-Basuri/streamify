import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const Header = () => {
    const navigate = useNavigate();
    
    return (
        <div className="flex items-center justify-between mb-8">
            <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white flex items-center gap-2"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
            </button>
            <h1 className="text-2xl font-bold text-white">Upload Video</h1>
        </div>
    );
};