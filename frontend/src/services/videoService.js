// Video service - handles all video-related API calls
import { api, ApiError } from "./api";

// Video API endpoints
const VIDEO_ENDPOINTS = {
    BASE: "/api/v1/videos",
    UPLOAD: "/api/v1/videos/upload",
    UPDATE: (id) => `/api/v1/videos/update/${id}`,
    DELETE: (id) => `/api/v1/videos/${id}`,
    GET_BY_ID: (id) => `/api/v1/videos/${id}`,
    INCREMENT_VIEWS: (id) => `/api/v1/videos/${id}/views`,
    TOGGLE_PUBLISH: (id) => `/api/v1/videos/${id}/publish`,
    USER_VIDEOS: (userId) => `/api/v1/videos/user/${userId}`,
    DOWNLOAD: (id) => `/api/v1/videos/${id}/download`,
    RECOMMENDATIONS: (videoId) =>
        videoId
            ? `/api/v1/videos/recommendations/${videoId}`
            : `/api/v1/videos/recommendations`,
};

/**
 * Get all videos with pagination and advanced filters
 * @param {Object} options - { page, limit, sort, search, duration, date, tags }
 * @returns {Promise<Object>} Paginated video list
 */
export const getAllVideos = async ({
    page = 1,
    limit = 10,
    sort = "newest",
    search = "",
    duration = "", // short, medium, long
    date = "", // today, week, month, year
    tags = [],
} = {}) => {
    try {
        const params = { page, limit, sort };
        if (search) params.search = search;
        if (duration) params.duration = duration;
        if (date) params.date = date;
        if (tags.length > 0) params.tags = tags.join(",");

        const response = await api.get(VIDEO_ENDPOINTS.BASE, { params });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get recommended videos (based on current video or trending)
 * @param {string} videoId - Optional current video ID for context
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Object>} Recommended videos
 */
export const getRecommendedVideos = async (videoId = null, limit = 10) => {
    try {
        const response = await api.get(
            VIDEO_ENDPOINTS.RECOMMENDATIONS(videoId),
            {
                params: { limit },
            }
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Video data
 */
export const getVideoById = async (videoId) => {
    try {
        const response = await api.get(VIDEO_ENDPOINTS.GET_BY_ID(videoId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Upload a new video
 * @param {Object} videoData - { videoFile, thumbnail, title, description, tags }
 * @param {Function} onProgress - Upload progress callback (0-100)
 * @returns {Promise<Object>} Created video data
 */
export const uploadVideo = async (videoData, onProgress) => {
    const formData = new FormData();
    formData.append("videoFile", videoData.videoFile);
    formData.append("title", videoData.title);
    formData.append("description", videoData.description);
    formData.append("tags", JSON.stringify(videoData.tags || []));

    if (videoData.thumbnail) {
        formData.append("thumbnail", videoData.thumbnail);
    }

    try {
        const response = await api.upload(
            VIDEO_ENDPOINTS.UPLOAD,
            formData,
            onProgress
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Update video details
 * @param {string} videoId - Video ID
 * @param {Object} updateData - Fields to update
 * @param {Function} onProgress - Upload progress callback (for thumbnail)
 * @returns {Promise<Object>} Updated video data
 */
export const updateVideo = async (videoId, updateData, onProgress) => {
    const formData = new FormData();

    if (updateData.title) formData.append("title", updateData.title);
    if (updateData.description)
        formData.append("description", updateData.description);
    if (updateData.tags)
        formData.append("tags", JSON.stringify(updateData.tags));
    if (updateData.thumbnail)
        formData.append("thumbnail", updateData.thumbnail);

    try {
        const response = await api.upload(
            VIDEO_ENDPOINTS.UPDATE(videoId),
            formData,
            onProgress
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Delete a video
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteVideo = async (videoId) => {
    try {
        const response = await api.delete(VIDEO_ENDPOINTS.DELETE(videoId));
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Increment video view count
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Updated view count
 */
export const incrementViews = async (videoId) => {
    try {
        const response = await api.post(
            VIDEO_ENDPOINTS.INCREMENT_VIEWS(videoId)
        );
        return response.data.data;
    } catch (error) {
        // Don't throw for view increment failures - not critical
        console.error("Failed to increment views:", error);
        return null;
    }
};

/**
 * Toggle video publish status
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Updated video data
 */
export const togglePublishStatus = async (videoId) => {
    try {
        const response = await api.patch(
            VIDEO_ENDPOINTS.TOGGLE_PUBLISH(videoId)
        );
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get videos for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - { sort, search }
 * @returns {Promise<Object>} User's videos
 */
export const getUserVideos = async (
    userId,
    { sort = "newest", search = "" } = {}
) => {
    try {
        const response = await api.get(VIDEO_ENDPOINTS.USER_VIDEOS(userId), {
            params: { sort, search },
        });
        return response.data.data;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

/**
 * Get download URL for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<string>} Signed download URL
 */
export const getDownloadUrl = async (videoId) => {
    try {
        const response = await api.get(VIDEO_ENDPOINTS.DOWNLOAD(videoId));
        return response.data.data.url;
    } catch (error) {
        if (error.isApiError) throw error;
        throw ApiError.fromAxiosError(error);
    }
};

export default {
    getAllVideos,
    getVideoById,
    uploadVideo,
    updateVideo,
    deleteVideo,
    incrementViews,
    togglePublishStatus,
    getUserVideos,
    getDownloadUrl,
    getRecommendedVideos,
};
