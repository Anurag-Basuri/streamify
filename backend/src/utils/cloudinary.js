import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
/**
 * Generates a signed URL for downloading a video from Cloudinary
 * @param {string} publicId - The public ID of the resource in Cloudinary
 * @param {Object} options - Optional parameters
 * @param {number} options.expiresIn - URL expiration time in seconds (default: 3600)
 * @param {boolean} options.attachment - Whether to force download as attachment (default: true)
 * @returns {Promise<string>} A signed URL for downloading the resource
 */

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Generate signed URL for downloading a video from Cloudinary
const generateCloudinarySignedUrl = async (publicId, options = {}) => {
    if (!publicId) {
        throw new Error("Public ID is required to generate download URL");
    }
    
    const defaultOptions = {
        expiresIn: 3600, // 1 hour
        attachment: true,
    };

    const { expiresIn, attachment } = { ...defaultOptions, ...options };
    
    // Generate a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Set up the options for the signed URL
    const urlOptions = {
        resource_type: 'video',
        timestamp,
        expires_at: timestamp + expiresIn
    };
    
    // Add attachment option if needed
    if (attachment) {
        urlOptions.attachment = true;
    }
    
    // Generate signed URL
    try {
        const url = cloudinary.utils.private_download_url(
        publicId,
        'mp4', // Format
        urlOptions
        );
        
        return url;
    } catch (error) {
        console.error("Error generating Cloudinary signed URL:", error);
        throw new Error("Failed to generate download URL");
    }
};


// Upload video on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Ensure localFilePath is a string (should be path from multer)
        if (typeof localFilePath !== "string") {
            throw new Error("Invalid file path");
        }

        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("Cloudinary upload successful:", response);

        // Remove the local file after upload
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the file if upload fails
        }
        throw error; // Rethrow the error so the controller knows about it
    }
};


export { uploadOnCloudinary, generateCloudinarySignedUrl };
