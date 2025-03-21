import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { APIerror } from "../utils/APIerror.js";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path.replace(/\\/g, "/"));

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Create temporary directory
const tmpDir = "./public";
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Requires path
    },
});

// File filter middleware
const fileFilter = (req, file, cb) => {
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    const validImageTypes = ["image/jpeg", "image/png"];

    if (
        file.fieldname === "videoFile" &&
        !validVideoTypes.includes(file.mimetype)
    ) {
        return cb(new APIerror(400, "Invalid video format"), false);
    }

    if (
        file.fieldname === "thumbnail" &&
        !validImageTypes.includes(file.mimetype)
    ) {
        return cb(new APIerror(400, "Invalid image format"), false);
    }

    cb(null, true);
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

// Compressor
const compressVideo = (inputPath, outputPath) => {
    console.log("Windows input path:", inputPath);
    console.log("FFmpeg path:", ffmpegInstaller.path);

    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputPath)) {
            return reject(new Error("Input file not found"));
        }

        console.log(`Starting compression from: ${inputPath} to ${outputPath}`);

        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec("libx264")
            .outputOptions(["-crf 28", "-preset medium"])
            .on("start", (commandLine) => {
                console.log("FFmpeg command:", commandLine);
            })
            .on("progress", (progress) => {
                console.log(
                    `Processing: ${Math.round(progress.percent)}% done`
                );
            })
            .on("end", () => {
                console.log("Compression finished successfully");
                resolve();
            })
            .on("error", (err) => {
                console.error("FFmpeg error:", err);
                reject(
                    new Error(
                        "Video compression failed. Check FFmpeg installation."
                    )
                );
            })
            .run();
    });
};

// Configure multer
const uploadFields = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB limit
}).fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);

export { uploadAvatar, uploadCoverImage, uploadFields, compressVideo };
