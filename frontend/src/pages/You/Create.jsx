import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

const Create = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: [],
        newTag: "",
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTagInput = (e) => {
        if (e.key === "Enter" && formData.newTag.trim()) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, prev.newTag.trim()],
                newTag: "",
            }));
        }
    };

    const removeTag = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleFileUpload = async (file, type) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "your_upload_preset");

        try {
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/your_cloud_name/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (err) {
            setError("File upload failed");
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!videoFile || !thumbnail) {
            setError("Please upload both video and thumbnail");
            return;
        }

        try {
            setLoading(true);
            const videoUrl = await handleFileUpload(videoFile, "video");
            const thumbnailUrl = await handleFileUpload(thumbnail, "image");

            // Call your backend API here
            const response = await fetch("/api/v1/videos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
                body: JSON.stringify({
                    ...formData,
                    videoFile: videoUrl,
                    thumbnail: thumbnailUrl,
                }),
            });

            if (!response.ok) throw new Error("Upload failed");

            navigate("/");
        } catch (err) {
            setError(err.message || "Failed to upload video");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Upload New Video</h1>

                {error && (
                    <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Upload */}
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                    setVideoFile(e.target.files[0])
                                }
                                className="hidden"
                                required
                            />
                            <div className="space-y-4">
                                <FaCloudUploadAlt className="text-4xl mx-auto text-orange-500" />
                                <p className="text-lg">
                                    {videoFile
                                        ? videoFile.name
                                        : "Select video file"}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    MP4, MOV, AVI (Max 2GB)
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setThumbnail(e.target.files[0])
                                }
                                className="hidden"
                                required
                            />
                            <div className="space-y-4">
                                <FaCloudUploadAlt className="text-4xl mx-auto text-orange-500" />
                                <p className="text-lg">
                                    {thumbnail
                                        ? thumbnail.name
                                        : "Select thumbnail"}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    JPG, PNG (Recommended 1280x720)
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Title Input */}
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

                    {/* Description Input */}
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

                    {/* Tags Input */}
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
                                className="bg-transparent w-full p-2 focus:outline-none"
                                placeholder="Type tag and press Enter"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center"
                    >
                        {loading ? (
                            <span className="animate-pulse">Uploading...</span>
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
