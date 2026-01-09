import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { uploadVideo } from "../services/videoService";

// File validation constants
const VALIDATION = {
    VIDEO: {
        MAX_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
        ALLOWED_TYPES: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
        ],
    },
    THUMBNAIL: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
    },
};

/**
 * Format bytes to human readable string
 */
const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Custom hook for video upload with validation and progress tracking
 * @param {Object} formData - Form data with title, description, tags
 * @param {Function} navigate - React Router navigate function
 * @returns {Object} Upload state and controls
 */
const useUpload = (formData, navigate) => {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Validate and set file
     */
    const handleFileUpload = useCallback((type, file) => {
        if (!file) return;

        setError(null);

        if (type === "video") {
            // Validate video type
            if (!VALIDATION.VIDEO.ALLOWED_TYPES.includes(file.type)) {
                const errorMsg =
                    "Please upload a valid video file (MP4, WebM, MOV, or AVI)";
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }

            // Validate video size
            if (file.size > VALIDATION.VIDEO.MAX_SIZE) {
                const errorMsg = `Video file size must be less than ${formatBytes(
                    VALIDATION.VIDEO.MAX_SIZE
                )}`;
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }

            setVideoFile(file);
            toast.success(`Video selected: ${file.name}`);
        }

        if (type === "thumbnail") {
            // Validate thumbnail type
            if (!VALIDATION.THUMBNAIL.ALLOWED_TYPES.includes(file.type)) {
                const errorMsg =
                    "Please upload a valid image file (JPEG, PNG, or WebP)";
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }

            // Validate thumbnail size
            if (file.size > VALIDATION.THUMBNAIL.MAX_SIZE) {
                const errorMsg = `Thumbnail size must be less than ${formatBytes(
                    VALIDATION.THUMBNAIL.MAX_SIZE
                )}`;
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }

            setThumbnail(file);
            toast.success("Thumbnail selected");
        }
    }, []);

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate required fields
        if (!videoFile) {
            const errorMsg = "Please select a video file";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!formData.title?.trim()) {
            const errorMsg = "Please enter a video title";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(0);

            const video = await uploadVideo(
                {
                    videoFile,
                    thumbnail,
                    title: formData.title,
                    description: formData.description || "",
                    tags: formData.tags || [],
                },
                (progress) => setUploadProgress(progress)
            );

            toast.success("Video uploaded successfully!");
            navigate(`/video/${video._id}`);
        } catch (err) {
            const errorMsg = err.message || "Failed to upload video";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    /**
     * Reset form state
     */
    const reset = useCallback(() => {
        setVideoFile(null);
        setThumbnail(null);
        setUploadProgress(0);
        setError(null);
    }, []);

    return {
        videoFile,
        thumbnail,
        uploadProgress,
        loading,
        error,
        handleFileUpload,
        handleSubmit,
        reset,
    };
};

export default useUpload;
