/**
 * Cloudinary Utility Module
 * Handles file uploads and signed URL generation for Cloudinary
 */
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration - only configure if credentials exist
const configureCloudinary = () => {
    const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
        console.warn("⚠️ Cloudinary credentials not fully configured");
        return false;
    }

    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: API_KEY,
        api_secret: API_SECRET,
        secure: true, // Always use HTTPS
    });

    return true;
};

// Initialize on module load
configureCloudinary();

/**
 * Verifies Cloudinary connection by pinging the API
 * @returns {Promise<boolean>}
 */
export const verifyCloudinaryConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        if (result.status === "ok") {
            console.log("✅ Cloudinary connection verified");
            return true;
        }
        throw new Error("Unexpected response from Cloudinary");
    } catch (error) {
        console.error("❌ Cloudinary connection failed:", error.message);
        return false;
    }
};

/**
 * Safely removes a local file
 * @param {string} filePath - Path to the file to remove
 */
const safeUnlink = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Failed to remove file ${filePath}:`, error.message);
    }
};

/**
 * Uploads a file to Cloudinary
 * @param {string} localFilePath - Path to the local file
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder to upload to
 * @param {string} options.resourceType - Resource type (auto, image, video, raw)
 * @returns {Promise<Object|null>} Cloudinary upload response or null
 */
export const uploadOnCloudinary = async (localFilePath, options = {}) => {
    if (!localFilePath) {
        console.warn("Upload attempted with no file path");
        return null;
    }

    // Validate file path is a string
    if (typeof localFilePath !== "string") {
        throw new Error("Invalid file path: expected string");
    }

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
        throw new Error(`File not found: ${localFilePath}`);
    }

    const uploadOptions = {
        resource_type: options.resourceType || "auto",
        folder: options.folder || "streamify",
        ...options,
    };

    try {
        const response = await cloudinary.uploader.upload(
            localFilePath,
            uploadOptions
        );

        // Remove local file after successful upload
        safeUnlink(localFilePath);

        console.log(`✅ Uploaded to Cloudinary: ${response.public_id}`);
        return response;
    } catch (error) {
        // Remove local file on error too
        safeUnlink(localFilePath);

        console.error("❌ Cloudinary upload failed:", error.message);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

/**
 * Deletes a resource from Cloudinary
 * @param {string} publicId - The public ID of the resource
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) {
        throw new Error("Public ID is required for deletion");
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        if (result.result === "ok") {
            console.log(`✅ Deleted from Cloudinary: ${publicId}`);
        } else {
            console.warn(`⚠️ Cloudinary deletion returned: ${result.result}`);
        }

        return result;
    } catch (error) {
        console.error("❌ Cloudinary deletion failed:", error.message);
        throw error;
    }
};

/**
 * Generates a signed URL for downloading a video from Cloudinary
 * @param {string} publicId - The public ID of the resource
 * @param {Object} options - Optional parameters
 * @param {number} options.expiresIn - URL expiration time in seconds (default: 3600)
 * @param {boolean} options.attachment - Force download as attachment (default: true)
 * @returns {Promise<string>} A signed URL for downloading the resource
 */
export const generateCloudinarySignedUrl = async (publicId, options = {}) => {
    if (!publicId) {
        throw new Error("Public ID is required to generate download URL");
    }

    const { expiresIn = 3600, attachment = true } = options;

    const timestamp = Math.round(Date.now() / 1000);

    const urlOptions = {
        resource_type: "video",
        timestamp,
        expires_at: timestamp + expiresIn,
        ...(attachment && { attachment: true }),
    };

    try {
        const url = cloudinary.utils.private_download_url(
            publicId,
            "mp4",
            urlOptions
        );

        return url;
    } catch (error) {
        console.error("❌ Failed to generate signed URL:", error.message);
        throw new Error("Failed to generate download URL");
    }
};

/**
 * Gets resource details from Cloudinary
 * @param {string} publicId - The public ID of the resource
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>}
 */
export const getResourceDetails = async (publicId, resourceType = "video") => {
    if (!publicId) {
        throw new Error("Public ID is required");
    }

    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch (error) {
        console.error("❌ Failed to get resource details:", error.message);
        throw error;
    }
};

export default {
    uploadOnCloudinary,
    deleteFromCloudinary,
    generateCloudinarySignedUrl,
    verifyCloudinaryConnection,
    getResourceDetails,
};
