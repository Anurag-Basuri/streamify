import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { APIerror } from "../utils/APIerror.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Custom Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "video-platform",
        resource_type: "auto",
        allowed_formats: [
            "mp4",
            "mov",
            "avi",
            "mkv",
            "webm",
            "jpg",
            "jpeg",
            "png",
        ],
        transformation: [{ width: 1280, height: 720, crop: "limit" }],
    },
});

// File filter middleware
const fileFilter = (req, file, cb) => {
    try {
        // Allow only video and image files
        if (
            file.mimetype.startsWith("video/") ||
            file.mimetype.startsWith("image/")
        ) {
            cb(null, true);
        } else {
            cb(
                new APIerror(
                    400,
                    "Invalid file type - Only videos and images allowed"
                ),
                false
            );
        }
    } catch (error) {
        cb(new APIerror(500, "File filtering failed"), false);
    }
};

// Configure multer with error handling
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 500, // 500MB limit
        files: 2, // Maximum 2 files (video + thumbnail)
    },
}).fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);

// Custom error handling middleware wrapper
const handleUpload = (req, res, next) => {
    upload(req, res, (err) => {
        try {
            if (err) {
                if (err instanceof multer.MulterError) {
                    // Handle specific Multer errors
                    if (err.code === "LIMIT_FILE_SIZE") {
                        throw new APIerror(
                            413,
                            "File too large - Maximum 500MB allowed"
                        );
                    }
                    if (err.code === "LIMIT_FILE_COUNT") {
                        throw new APIerror(
                            400,
                            "Too many files - Only video and thumbnail allowed"
                        );
                    }
                }
                throw err;
            }

            // Validate required files
            if (!req.files?.videoFile?.[0] || !req.files?.thumbnail?.[0]) {
                throw new APIerror(
                    400,
                    "Both video and thumbnail are required"
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    });
};

export { handleUpload as upload };