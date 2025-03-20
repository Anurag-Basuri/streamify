import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaTimes, FaSpinner, FaTag } from "react-icons/fa";
import { motion } from "framer-motion";

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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // For drag-and-drop feedback
    const videoRef = useRef(null);
    const thumbnailRef = useRef(null);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            if (videoRef.current?.src) {
                URL.revokeObjectURL(videoRef.current.src);
            }
            if (thumbnailRef.current?.src) {
                URL.revokeObjectURL(thumbnailRef.current.src);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const removeTag = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove),
        }));
    };

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

    const handleFileUpload = (type, file) => {
        if (!file) return;

        if (type === "video") {
            if (!file.type.startsWith("video/")) {
                setError("Please upload a valid video file (MP4, MOV, AVI)");
                return;
            }
            setVideoFile(file);
            if (videoRef.current) {
                videoRef.current.src = URL.createObjectURL(file);
            }
        } else {
            if (!file.type.startsWith("image/")) {
                setError("Please upload a valid image file (JPG, PNG)");
                return;
            }
            setThumbnail(file);
            if (thumbnailRef.current) {
                thumbnailRef.current.src = URL.createObjectURL(file);
            }
        }
    };

    const handleDragDrop = (type, e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(type, file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submit handler triggered"); // Initial log

        try {
            // 1. Basic validation
            if (!videoFile || !thumbnail) {
                console.log("Files missing validation failed");
                throw new Error("Please select both video and thumbnail");
            }

            // 2. Create FormData and log entries
            const formPayload = new FormData();
            formPayload.append("videoFile", videoFile, videoFile.name);
            formPayload.append("thumbnail", thumbnail, thumbnail.name);
            formPayload.append("title", formData.title);
            formPayload.append("description", formData.description);
            formPayload.append("tags", JSON.stringify(formData.tags));

            // Log FormData entries
            for (const [key, value] of formPayload.entries()) {
                console.log(key, value);
            }

            // 3. Send request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch("/api/v1/videos/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
                body: formPayload,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            // 4. Handle response
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            navigate(`/video/${data.data._id}`);
        } catch (err) {
            console.error("Full error details:", {
                message: err.message,
                stack: err.stack,
                name: err.name,
            });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const FileUploadArea = ({ type, file, previewRef }) => (
        <motion.div
            className={`border-3 border-dashed rounded-xl p-6 text-center transition-colors
                ${
                    file
                        ? "border-green-500/30"
                        : isDragging
                        ? "border-orange-400"
                        : "border-gray-700 hover:border-orange-400"
                }
                relative overflow-hidden group`}
            whileHover={{ scale: 1.02 }}
            onDrop={(e) => handleDragDrop(type, e)}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
        >
            <label className="cursor-pointer block space-y-4">
                <input
                    type="file"
                    accept={type === "video" ? "video/*" : "image/*"}
                    onChange={(e) => handleFileUpload(type, e.target.files[0])}
                    className="hidden"
                    required
                />

                {file ? (
                    <>
                        {type === "video" ? (
                            <video
                                ref={previewRef}
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-xl"
                                controls
                            />
                        ) : (
                            <img
                                ref={previewRef}
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-xl"
                                alt="Thumbnail preview"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium">
                                Click to change {type}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4 py-8">
                        <FaCloudUploadAlt className="text-4xl mx-auto text-orange-400" />
                        <p className="text-lg font-medium">
                            Drag & drop {type} or click to upload
                        </p>
                        <p className="text-gray-400 text-sm">
                            {type === "video"
                                ? "MP4, MOV, AVI (Max 2GB)"
                                : "JPG, PNG (Recommended 16:9)"}
                        </p>
                    </div>
                )}
            </label>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    Upload New Video
                </h1>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl mb-6 flex items-center gap-3"
                    >
                        <FaTimes className="flex-shrink-0 text-red-400" />
                        <p className="text-red-300">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <FileUploadArea
                            type="video"
                            file={videoFile}
                            previewRef={videoRef}
                        />
                        <FileUploadArea
                            type="image"
                            file={thumbnail}
                            previewRef={thumbnailRef}
                        />
                    </div>

                    {uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Upload Progress:</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-500"
                                placeholder="Awesome video title..."
                                minLength={5}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 rounded-xl p-4 h-32 focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-500"
                                placeholder="Describe your video content..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                <FaTag className="text-orange-400" />
                                Tags
                            </label>
                            <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                                        >
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(index)}
                                                className="text-gray-400 hover:text-orange-400 transition-colors"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    name="newTag"
                                    value={formData.newTag}
                                    onChange={handleInputChange}
                                    onKeyDown={handleTagInput}
                                    className="bg-transparent w-full p-2 focus:outline-none placeholder-gray-500"
                                    placeholder="Add tag and press Enter..."
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium py-4 rounded-xl transition-all 
                                   flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Uploading... {uploadProgress}%</span>
                            </>
                        ) : (
                            "Publish Video 🚀"
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Create;
