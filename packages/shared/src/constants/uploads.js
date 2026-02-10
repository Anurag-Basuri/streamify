/**
 * @streamify/shared — Upload Limits
 * Used by both frontend (validation) and backend (enforcement)
 */

export const UPLOAD_LIMITS = {
    VIDEO_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
    IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
};
