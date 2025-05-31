import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useAuth from './useAuth';

const useUpload = (formData, navigate) => {
    const { user } = useAuth();
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = useCallback((type, file) => {
        if (!file) return;

        // Validate video file
        if (type === 'video') {
            if (!file.type.startsWith('video/')) {
                toast.error('Please upload a valid video file');
                return;
            }
            if (file.size > 2048 * 1024 * 1024) { // 2GB
                toast.error('Video file size must be less than 2GB');
                return;
            }
            setVideoFile(file);
        }

        // Validate thumbnail
        if (type === 'thumbnail') {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error('Thumbnail size must be less than 5MB');
                return;
            }
            setThumbnail(file);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!videoFile) {
            toast.error('Please select a video file');
            return;
        }

        try {
            setLoading(true);
            const formPayload = new FormData();
            
            // Append video file and metadata
            formPayload.append('videoFile', videoFile);
            formPayload.append('title', formData.title);
            formPayload.append('description', formData.description);
            formPayload.append('tags', JSON.stringify(formData.tags));
            
            if (thumbnail) {
                formPayload.append('thumbnail', thumbnail);
            }

            const response = await axios.post('/api/v1/videos/upload', formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            });

            toast.success('Video uploaded successfully!');
            navigate(`/video/${response.data.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload video');
            console.error('Upload error:', error);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return {
        videoFile,
        thumbnail,
        uploadProgress,
        loading,
        handleFileUpload,
        handleSubmit
    };
};

export default useUpload;