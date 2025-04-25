import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const useVideoEdit = (videoID, user) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: "",
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [currentThumbnail, setCurrentThumbnail] = useState("");
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchVideo = async () => {
        try {
            const response = await axios.get(`/api/v1/videos/${videoID}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const videoData = response.data.data;

            if (videoData.owner._id !== user._id.toString()) {
                navigate("/uservideos");
                toast.error("Unauthorized access");
                return;
            }

            setFormData({
                title: videoData.title,
                description: videoData.description || "",
                tags: videoData.tags.join(", "),
            });
            setCurrentThumbnail(videoData.thumbnail?.url || "");
            setVideo(videoData);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch video");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData, thumbnail) => {
        setLoading(true);
        try {
            const formPayload = new FormData();
            formPayload.append("title", formData.title);
            formPayload.append("description", formData.description);
            formPayload.append(
                "tags",
                JSON.stringify(
                    formData.tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag)
                )
            );
            if (thumbnail) {
                formPayload.append("thumbnail", thumbnail);
            }

            await axios.patch(`/api/v1/videos/update/${videoID}`, formPayload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${user.token}`,
                },
            });

            toast.success("Video updated successfully");
            navigate("/uservideos");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update video");
            toast.error(err.response?.data?.message || "Failed to update video");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        thumbnail,
        setThumbnail,
        currentThumbnail,
        setCurrentThumbnail,
        video,
        loading,
        error,
        fetchVideo,
        handleSubmit,
    };
};

export default useVideoEdit;