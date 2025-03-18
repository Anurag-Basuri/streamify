import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaTimes, FaSpinner } from "react-icons/fa";

const Create = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: [],
        newTag: "",
        duration: 0,
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const videoRef = useRef(null);
    const thumbnailRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add this tag removal function if missing
    const removeTag = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove),
        }));
    };

    // Add this tag input handler if missing
    const handleTagInput = (e) => {
        if (e.key === "Enter" && formData.newTag.trim()) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, prev.newTag.trim()],
                newTag: "",
            }));
            e.preventDefault();
        }
    };

    // Preview handlers
    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            if (videoRef.current) {
                const previewUrl = URL.createObjectURL(file);
                videoRef.current.src = previewUrl;
            } else {
                console.error("Video ref is not attached to a DOM element");
            }
        }
    };

    const handleThumbnailUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            if (thumbnailRef.current) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    thumbnailRef.current.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                console.error("Thumbnail ref is not attached to a DOM element");
            }
        }
    };

    // Enhanced form handling
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        try {
            setLoading(true);
            if (!videoFile || !thumbnail) {
                throw new Error("Please select both video and thumbnail");
            }

            const formPayload = new FormData();
            formPayload.append("videoFile", videoFile);
            formPayload.append("thumbnail", thumbnail);
            formPayload.append("title", formData.title);
            formPayload.append("description", formData.description);
            formPayload.append("duration", parseFloat(formData.duration));
            formPayload.append("tags", JSON.stringify(formData.tags));

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/v1/videos/upload");
            xhr.setRequestHeader(
                "Authorization",
                `Bearer ${localStorage.getItem("accessToken")}`
            );

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const data = JSON.parse(xhr.response);
                    navigate(`/video/${data.data._id}`);
                } else {
                    const error = JSON.parse(xhr.response);
                    throw new Error(error.message || "Upload failed");
                }
            };

            xhr.onerror = () => {
                throw new Error("Network error - please try again");
            };

            xhr.send(formPayload);
        } catch (err) {
            setError(err.message);
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    // UI components
    const FileUploadBox = ({ type, onChange, accept, file, previewRef }) => (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
            <label className="cursor-pointer block">
                <input
                    type="file"
                    accept={accept}
                    onChange={onChange}
                    className="hidden"
                    required
                />
                {file ? (
                    <div className="relative group">
                        {type === "video" ? (
                            <video
                                ref={previewRef}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                                controls
                            />
                        ) : (
                            <img
                                ref={previewRef}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                                alt="Thumbnail preview"
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 py-8">
                        <FaCloudUploadAlt className="text-4xl mx-auto text-orange-500" />
                        <p className="text-lg">
                            {type === "video"
                                ? "Select video file"
                                : "Select thumbnail"}
                        </p>
                        <p className="text-gray-400 text-sm">
                            {type === "video"
                                ? "MP4, MOV, AVI (Max 2GB)"
                                : "JPG, PNG (Recommended 1280x720)"}
                        </p>
                    </div>
                )}
            </label>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Upload New Video</h1>

                {error && (
                    <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-6 flex items-center gap-2">
                        <FaTimes className="flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Upload */}
                    <FileUploadBox
                        type="video"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        file={videoFile}
                        previewRef={videoRef}
                    />

                    {/* Thumbnail Upload */}
                    <FileUploadBox
                        type="image"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        file={thumbnail}
                        previewRef={thumbnailRef}
                    />

                    {/* Progress Bar */}
                    {uploadProgress > 0 && (
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-orange-500">
                                        {uploadProgress}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
                                <div
                                    style={{ width: `${uploadProgress}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* Form Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter video title"
                                minLength={5}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Duration (seconds)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter video duration"
                                min="0.1"
                                step="0.1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 rounded-lg p-3 h-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Describe your video"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tags
                            </label>
                            <div className="bg-gray-800 rounded-lg p-2">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(index)}
                                                className="text-gray-400 hover:text-orange-500"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    name="newTag"
                                    value={formData.newTag}
                                    onChange={handleInputChange}
                                    onKeyDown={handleTagInput}
                                    className="bg-transparent w-full p-2 focus:outline-none placeholder-gray-500"
                                    placeholder="Type tag and press Enter"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Uploading ({uploadProgress}%)</span>
                            </>
                        ) : (
                            "Publish Video"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Create;
