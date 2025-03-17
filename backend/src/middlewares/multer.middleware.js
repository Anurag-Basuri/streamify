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

// Configure multer with different upload handlers
const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for avatar
}).single("avatar");

const uploadCoverImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for cover image
}).single("coverImage");

const uploadFields = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for each file
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]);

export { uploadAvatar, uploadCoverImage, uploadFields };
