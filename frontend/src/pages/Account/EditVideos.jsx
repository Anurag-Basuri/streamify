import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
    ArrowUturnLeftIcon,
    CloudArrowUpIcon,
    PhotoIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import useAuth from "../../hooks/useAuth";
import useVideoEdit from "../../hooks/useVideoEdit";

const EditVideo = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        formData,
        setFormData,
        thumbnail,
        setThumbnail,
        currentThumbnail,
        setCurrentThumbnail,
        video,
        loading,
        error,
        fetchVideo,
        handleSubmit,
    } = useVideoEdit(videoID, user);

    useEffect(() => {
        fetchVideo();
    }, [fetchVideo]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Thumbnail size must be less than 5MB");
                return;
            }

            setThumbnail(file);
            setCurrentThumbnail(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        await handleSubmit(formData, thumbnail);
    };

    if (loading) {
        return <div className="text-center py-8">Loading video details...</div>;
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                        <span className="font-medium">Back to Videos</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <PhotoIcon className="w-8 h-8 text-blue-600" />
                        Edit Video Details
                    </h1>
                </div>

                {/* Main Content */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
                >
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Video Preview Section */}
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                            {currentThumbnail && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                        Current Preview
                                    </p>
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <img
                                            src={currentThumbnail}
                                            alt="Video thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                        {video?.duration && (
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                                                {Math.floor(
                                                    video.duration / 60
                                                )}
                                                :
                                                {(video.duration % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {formData.title || "Untitled Video"}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                                {formData.description || "No description"}
                            </p>
                        </div>

                        {/* Form Sections */}
                        <div className="space-y-6">
                            {/* Title Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Video Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter video title"
                                    minLength="5"
                                    maxLength="100"
                                    required
                                />
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Minimum 5 characters
                                    </span>
                                    <span className="text-gray-500">
                                        {formData.title.length}/100
                                    </span>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                                    placeholder="Describe your video content"
                                />
                            </div>

                            {/* Tags Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Tags
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="comma, separated, tags"
                                    />
                                    <span className="absolute right-3 top-3 text-gray-400 text-sm">
                                        {
                                            formData.tags
                                                .split(",")
                                                .filter((t) => t.trim()).length
                                        }{" "}
                                        tags
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnail Upload Section */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Thumbnail Image
                                </label>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 transition-colors">
                                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
                                    <span className="text-blue-600 font-medium">
                                        Click to upload new thumbnail
                                    </span>
                                    <span className="text-gray-500 text-sm mt-1">
                                        PNG, JPG up to 5MB
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                </label>

                                {thumbnail && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            New Thumbnail Preview
                                        </p>
                                        <img
                                            src={currentThumbnail}
                                            alt="New thumbnail preview"
                                            className="w-48 h-auto rounded-lg shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <p className="text-red-600 flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            {error}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default EditVideo;
