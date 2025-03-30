import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

const EditVideo = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [video, setVideo] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: "",
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch video data
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await axios.get(`/api/v1/videos/${videoID}`);
                if (!response.data.success) throw new Error("Failed to fetch video");
                setVideo(response.data.data);
                setFormData({
                    title: response.data.data.title,
                    description: response.data.data.description,
                    tags: response.data.data.tags.join(", "),
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoID]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formPayload = new FormData();
            formPayload.append("title", formData.title);
            formPayload.append("description", formData.description);
            formPayload.append("tags", JSON.stringify(
                formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
            ));
            if (thumbnailFile) {
                formPayload.append("thumbnail", thumbnailFile);
            }

            const response = await axios.patch(
                `/api/v1/videos/update/${videoID}`,
                formPayload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            if (response.data.success) {
                navigate("/your-videos");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-8">Edit Video Details</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        minLength="5"
                        maxLength="100"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-3 border rounded-lg h-32"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                    />
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                        className="w-full p-3 border rounded-lg"
                    />
                    {video?.thumbnail?.url && !thumbnailFile && (
                        <img
                            src={video.thumbnail.url}
                            alt="Current thumbnail"
                            className="mt-2 w-48 rounded-lg"
                        />
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Update Video
                </button>
            </form>
        </motion.div>
    );
};

export default EditVideo;