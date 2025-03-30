import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/AuthContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const EditVideo = () => {
    const { videoID } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: "",
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [currentThumbnail, setCurrentThumbnail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await axios.get(`/api/v1/videos/${videoID}`);
                const video = response.data.data;

                if (!video.owner._id.equals(user._id)) {
                    throw new Error(
                        "You are not authorized to edit this video"
                    );
                }

                setFormData({
                    title: video.title,
                    description: video.description || "",
                    tags: video.tags.join(", "),
                });
                setCurrentThumbnail(video.thumbnail?.url || "");
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchVideo();
    }, [videoID, user._id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleThumbnailChange = (e) => {
        if (e.target.files[0]) {
            setThumbnail(e.target.files[0]);
            setCurrentThumbnail(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            toast.success("Video updated successfully");
            navigate("/your-videos");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update video");
            toast.error(
                err.response?.data?.message || "Failed to update video"
            );
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading video details...</div>;
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Edit Video Details</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        minLength="5"
                        maxLength="100"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Title must be 5-100 characters
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded h-32"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="tag1, tag2, tag3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Thumbnail
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="w-full p-2 border rounded"
                    />
                    {currentThumbnail && (
                        <div className="mt-2">
                            <p className="text-sm mb-1">Current Thumbnail:</p>
                            <img
                                src={currentThumbnail}
                                alt="Video thumbnail"
                                className="w-48 h-auto rounded"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Update Video
                </button>
            </form>
        </div>
    );
};

export default EditVideo;