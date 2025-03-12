import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateAvatar, updateCoverImage } from "../../services/authService.js";
import { AuthContext } from "../../services/AuthContext.jsx";
import { motion } from "framer-motion";

const Profile = () => {
    const { user, logout, isLoading, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleFileUpload = async (file, type) => {
        if (!file || user?.isGoogleUser) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            let response;
            if (type === "avatar") {
                response = await updateAvatar(file);
            } else {
                response = await updateCoverImage(file);
            }

            // Update user context with new data
            updateUser({
                [type]: response.data[type],
            });

            // Clear file input
            if (type === "avatar") setAvatarFile(null);
            if (type === "coverImage") setCoverImageFile(null);
        } catch (error) {
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/auth");
        }
    }, [user, isLoading, navigate]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
        >
            {/* Cover Image Section */}
            <div className="relative h-48 bg-gray-100">
                {coverImageFile ? (
                    <div className="relative h-full">
                        <img
                            src={URL.createObjectURL(coverImageFile)}
                            className="w-full h-full object-cover"
                            alt="Preview cover"
                        />
                        {!user?.isGoogleUser && (
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <button
                                    onClick={() =>
                                        handleFileUpload(
                                            coverImageFile,
                                            "coverImage"
                                        )
                                    }
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                                <button
                                    onClick={() => setCoverImageFile(null)}
                                    className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {user?.coverImage ? (
                            <img
                                src={user.coverImage}
                                className="w-full h-full object-cover"
                                alt="Cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        )}
                        {!user?.isGoogleUser && (
                            <label className="absolute bottom-2 right-2 bg-white/80 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-white">
                                Upload Cover
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) =>
                                        setCoverImageFile(e.target.files[0])
                                    }
                                    accept="image/*"
                                />
                            </label>
                        )}
                    </>
                )}
            </div>

            {/* Profile Content */}
            <div className="p-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative -mt-20">
                        {avatarFile ? (
                            <div className="relative">
                                <img
                                    src={URL.createObjectURL(avatarFile)}
                                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                                    alt="Preview"
                                />
                                {!user?.isGoogleUser && (
                                    <div className="absolute bottom-0 right-0 flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleFileUpload(
                                                    avatarFile,
                                                    "avatar"
                                                )
                                            }
                                            className="bg-blue-600 text-white p-1 rounded-full text-xs hover:bg-blue-700 disabled:opacity-50"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                "✓"
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setAvatarFile(null)}
                                            className="bg-gray-600 text-white p-1 rounded-full text-xs hover:bg-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <img
                                    src={user?.avatar || "/default-avatar.png"}
                                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                                    alt={
                                        user?.isGoogleUser
                                            ? "Google profile"
                                            : "Avatar"
                                    }
                                />
                                {!user?.isGoogleUser && (
                                    <label className="absolute bottom-0 right-0 bg-white/80 p-1 rounded-full cursor-pointer hover:bg-white">
                                        <svg
                                            className="w-6 h-6 text-gray-700"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) =>
                                                setAvatarFile(e.target.files[0])
                                            }
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {uploadError && (
                    <div className="text-red-500 text-sm mb-4">
                        Error: {uploadError}
                    </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {user?.fullName || "New User"}
                        {user?.isGoogleUser && (
                            <span className="ml-2 text-sm text-blue-600">
                                (Google)
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600">@{user?.userName}</p>
                    <p className="text-gray-600">{user?.email}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={logout}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;