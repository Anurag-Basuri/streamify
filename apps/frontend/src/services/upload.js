// Generic file upload service
import { api, ApiError } from "./api";

/**
 * Upload a generic file
 * @param {File} file - File to upload
 * @param {string} type - Upload type identifier
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Uploaded file URL
 */
export const uploadFile = async (file, type, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", type);

    try {
        const response = await api.upload(
            "/api/v1/upload",
            formData,
            onProgress
        );
        return response.data.url;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export default { uploadFile };
