import { apiClient } from "./authService";

// Generic file upload service
export const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", type);

    try {
        const { data } = await apiClient.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data.url;
    } catch (err) {
        throw new Error(err.response?.data?.message || "File upload failed");
    }
};
