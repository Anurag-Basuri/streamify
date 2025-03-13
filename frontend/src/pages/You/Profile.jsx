import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateAvatar, updateCoverImage } from "../../services/authService.js";
import { AuthContext } from "../../services/AuthContext.jsx";
import { motion } from "framer-motion";
import axios from "axios";
import PropTypes from "prop-types";

const Profile = () => {
    const { user, logout, isLoading, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get("/api/v1/dashboard", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                });
                console.log(response);
                setDashboardData(response.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoadingDashboard(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    // Handle file upload (avatar/cover image)
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

            updateUser({
                [type]: response.data[type],
            });

            if (type === "avatar") setAvatarFile(null);
            if (type === "coverImage") setCoverImageFile(null);
        } catch (error) {
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Redirect if user is not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/auth");
        }
    }, [user, isLoading, navigate]);

    // Loading state
    if (!user || loadingDashboard) {
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
            className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
        >
            {/* Cover Image Section */}
            <div className="relative h-64 bg-gray-100">
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

                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="Tweets"
                        value={dashboardData?.stats.tweetCount || 0}
                        icon="tweet"
                    />
                    <StatCard
                        title="Videos"
                        value={dashboardData?.stats.videoCount || 0}
                        icon="video"
                    />
                    <StatCard
                        title="Watch Later"
                        value={dashboardData?.stats.watchLaterCount || 0}
                        icon="watch"
                    />
                    <StatCard
                        title="Likes"
                        value={dashboardData?.stats.likeCount || 0}
                        icon="like"
                    />
                    <StatCard
                        title="Comments"
                        value={dashboardData?.stats.commentCount || 0}
                        icon="comment"
                    />
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* Tweets Section */}
                    {dashboardData?.tweets?.length > 0 && (
                        <ContentSection
                            title="Recent Tweets"
                            items={dashboardData.tweets}
                            renderItem={(tweet) => (
                                <div
                                    key={tweet._id}
                                    className="bg-gray-50 p-4 rounded-lg"
                                >
                                    <p className="text-gray-800">
                                        {tweet.content}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {new Date(
                                            tweet.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        />
                    )}

                    {/* Videos Section */}
                    {dashboardData?.videos?.length > 0 && (
                        <ContentSection
                            title="Recent Videos"
                            items={dashboardData.videos}
                            renderItem={(video) => (
                                <div
                                    key={video._id}
                                    className="bg-gray-50 p-4 rounded-lg"
                                >
                                    <h3 className="font-medium text-gray-800">
                                        {video.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {video.description}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {video.views} views •{" "}
                                        {new Date(
                                            video.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        />
                    )}

                    {/* Watch Later Section */}
                    {dashboardData?.watchLater?.length > 0 && (
                        <ContentSection
                            title="Watch Later"
                            items={dashboardData.watchLater}
                            renderItem={(video) => (
                                <div
                                    key={video._id}
                                    className="bg-gray-50 p-4 rounded-lg"
                                >
                                    <h3 className="font-medium text-gray-800">
                                        {video.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {video.description}
                                    </p>
                                </div>
                            )}
                        />
                    )}
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

// Stat Card Component with Prop Validation
const StatCard = ({ title, value, icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    icon: PropTypes.oneOf(["tweet", "video", "watch", "like", "comment"]),
};

// Content Section Component with Prop Validation
const ContentSection = ({ title, items, renderItem }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(renderItem)}
        </div>
    </div>
);

ContentSection.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            // Add other required fields based on your data structure
        })
    ).isRequired,
    renderItem: PropTypes.func.isRequired,
};

export default Profile;