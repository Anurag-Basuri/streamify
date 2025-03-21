import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaTimes, FaSpinner, FaTag } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

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
    const [isDragging, setIsDragging] = useState(false);
    const videoRef = useRef(null);
    const thumbnailRef = useRef(null);

    useEffect(() => {
        return () => {
            [videoRef, thumbnailRef].forEach((ref) => {
                if (ref.current?.src) URL.revokeObjectURL(ref.current.src);
            });
        };
    }, []);

    const validateFile = (file, type) => {
        const validVideoTypes = [
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
        ];
        const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

        if (type === "video" && !validVideoTypes.includes(file.type)) {
            throw new Error("Supported video formats: MP4, MOV, AVI");
        }

        if (type === "image" && !validImageTypes.includes(file.type)) {
            throw new Error("Supported image formats: JPEG, PNG, WEBP");
        }

        if (type === "video" && file.size > 2 * 1024 * 1024 * 1024) {
            throw new Error("Video file size must be less than 2GB");
        }

        if (type === "image" && file.size > 5 * 1024 * 1024) {
            throw new Error("Thumbnail size must be less than 5MB");
        }
    };

    const handleFileUpload = (type, file) => {
        try {
            if (!file) return;
            validateFile(file, type);
            setError("");

            const previewURL = URL.createObjectURL(file);
            if (type === "video") {
                setVideoFile(file);
                if (videoRef.current) videoRef.current.src = previewURL;
            } else {
                setThumbnail(file);
                if (thumbnailRef.current) thumbnailRef.current.src = previewURL;
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Basic validation
            if (!videoFile || !thumbnail) {
                throw new Error("Please select both video and thumbnail");
            }

            // 2. Create FormData with correct field names
            const formPayload = new FormData();
            formPayload.append("videoFile", videoFile); // Correct field name
            formPayload.append("thumbnail", thumbnail); // Correct field name
            formPayload.append("title", formData.title);
            formPayload.append("description", formData.description);
            formPayload.append("tags", JSON.stringify(formData.tags)); // Ensure tags are sent as JSON

            // 3. Log FormData entries for debugging
            for (const [key, value] of formPayload.entries()) {
                console.log(key, value);
            }

            // 4. Send request to backend
            const response = await axios.post(
                "http://localhost:8000/api/v1/videos/upload",
                formPayload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percent);
                    },
                }
            );

            if (response.status !== 201) {
                throw new Error(response.data.message || "Upload failed");
            }
    
            navigate(`/video/${response.data.data._id}`);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const FileUploadArea = ({ type, file, previewRef }) => (
        <motion.div
            className={`border-3 border-dashed rounded-2xl p-6 text-center transition-all
                ${
                    file
                        ? "border-green-500/20 bg-green-500/5"
                        : isDragging
                        ? "border-orange-400 bg-orange-500/10"
                        : "border-gray-700 hover:border-orange-400 bg-gray-800/30"
                }
                relative overflow-hidden group backdrop-blur-sm`}
            whileHover={{ scale: 1.02 }}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(type, e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
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
                <div className="space-y-4 py-8">
                    {file ? (
                        <>
                            {type === "video" ? (
                                <video
                                    ref={previewRef}
                                    className="w-full h-48 object-cover rounded-xl mb-4 shadow-2xl"
                                    controls
                                />
                            ) : (
                                <img
                                    ref={previewRef}
                                    className="w-full h-48 object-cover rounded-xl mb-4 shadow-2xl"
                                    alt="Thumbnail preview"
                                />
                            )}
                            <motion.div
                                className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                initial={{ opacity: 0 }}
                            >
                                <p className="text-white font-medium text-lg">
                                    Click to replace {type}
                                </p>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-500/20">
                                <FaCloudUploadAlt className="text-4xl text-orange-400" />
                            </div>
                            <p className="text-lg font-medium mt-4">
                                {isDragging
                                    ? "Drop it here!"
                                    : `Upload ${type}`}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {type === "video"
                                    ? "Drag & drop video file"
                                    : "Drag & drop thumbnail image"}
                            </p>
                        </>
                    )}
                </div>
            </label>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                        Share Your Creation
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Upload your video and connect with the community
                    </p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-red-500/20 border border-red-500/40 p-4 rounded-xl mb-8 flex items-center gap-3 backdrop-blur-sm"
                        >
                            <FaTimes className="flex-shrink-0 text-red-400" />
                            <p className="text-red-300">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 lg:grid-cols-2">
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

                    <div className="space-y-6 bg-gray-800/30 p-8 rounded-2xl backdrop-blur-sm">
                        <div>
                            <label className="block text-sm font-medium mb-4 text-gray-300">
                                Video Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full bg-gray-900/50 rounded-xl p-4 focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-600 text-gray-100"
                                placeholder="Enter an engaging title..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-4 text-gray-300">
                                Video Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full bg-gray-900/50 rounded-xl p-4 h-40 focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-600 text-gray-100"
                                placeholder="Tell viewers about your video..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-gray-300">
                                <FaTag className="text-orange-400" />
                                <span className="text-sm font-medium">
                                    Tags
                                </span>
                            </div>
                            <div className="bg-gray-900/50 rounded-xl p-4 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {formData.tags.map((tag, index) => (
                                            <motion.div
                                                key={tag}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="bg-gray-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            tags: formData.tags.filter(
                                                                (_, i) =>
                                                                    i !== index
                                                            ),
                                                        })
                                                    }
                                                    className="text-gray-400 hover:text-orange-400"
                                                >
                                                    <FaTimes className="text-xs" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <input
                                    type="text"
                                    value={formData.newTag}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            newTag: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            ["Enter", ","].includes(e.key) &&
                                            formData.newTag.trim()
                                        ) {
                                            e.preventDefault();
                                            if (formData.tags.length >= 5) {
                                                setError(
                                                    "Maximum 5 tags allowed"
                                                );
                                                return;
                                            }
                                            setFormData({
                                                ...formData,
                                                tags: [
                                                    ...formData.tags,
                                                    formData.newTag.trim(),
                                                ],
                                                newTag: "",
                                            });
                                        }
                                    }}
                                    className="bg-transparent w-full p-2 focus:outline-none placeholder-gray-600 text-gray-100"
                                    placeholder="Add tags (press Enter or comma)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.05 } : {}}
                            whileTap={!loading ? { scale: 0.95 } : {}}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium
                                       flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                        >
                            {loading && (
                                <motion.div
                                    className="absolute inset-0 bg-orange-500/20"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ ease: "linear" }}
                                />
                            )}
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>Uploading ({uploadProgress}%)</span>
                                </>
                            ) : (
                                "Publish Video 🚀"
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Create;