import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { updateAvatar, updateCoverImage } from "../../services/authService.js";
import { AuthContext } from "../../services/AuthContext.jsx";
import { motion } from "framer-motion";
import axios from "axios";
import PropTypes from "prop-types";

const Profile = () => {
    const { user, logout, isLoading, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [files, setFiles] = useState({
        avatar: null,
        cover: null,
    });
    const [uploadState, setUploadState] = useState({
        loading: false,
        error: null,
    });
    const [dashboard, setDashboard] = useState({
        data: null,
        loading: true,
    });
    const [dashboardError, setDashboardError] = useState(null);

    // const fetchDashboard = useCallback(async () => {
    //     try {
    //         const { data } = await axios.get(
    //             "http://localhost:8000/api/v1/dashboard",
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem(
    //                         "accessToken"
    //                     )}`,
    //                 },
    //             }
    //         );
    //         setDashboard({ data: data.data, loading: false });
    //         setDashboardError(null); // Clear any previous errors
    //     } catch (error) {
    //         setDashboard((prev) => ({ ...prev, loading: false }));
    //         setDashboardError(
    //             "Failed to load dashboard data. Please try again later."
    //         );
    //         console.error("Dashboard error:", error);

    //         // Log additional details
    //         if (error.response) {
    //             console.error("Response data:", error.response.data);
    //             console.error("Response status:", error.response.status);
    //             console.error("Response headers:", error.response.headers);
    //         } else if (error.request) {
    //             console.error("No response received:", error.request);
    //         } else {
    //             console.error("Error setting up request:", error.message);
    //         }
    //     }
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (user && localStorage.getItem("accessToken")) {
                try {
                    const { data } = await axios.get("/api/v1/dashboard", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "accessToken"
                            )}`,
                        },
                    });
                    console.log(data);
                    setDashboard({ data: data.data, loading: false });
                } catch (error) {
                    setDashboard({ data: null, loading: false });
                }
            }
        };

        fetchData();
    }, [user]);

    const handleFileUpload = useCallback(
        async (type) => {
            if (!files[type] || user?.isGoogleUser) return;

            setUploadState({ loading: true, error: null });
            try {
                const response =
                    type === "avatar"
                        ? await updateAvatar(files[type])
                        : await updateCoverImage(files[type]);

                updateUser({ [type]: response.data[type] });
                setFiles((prev) => ({ ...prev, [type]: null }));
            } catch (error) {
                setUploadState((prev) => ({
                    ...prev,
                    error: error.message,
                }));
            } finally {
                setUploadState((prev) => ({ ...prev, loading: false }));
            }
        },
        [files, updateUser, user]
    );

    useEffect(() => {
        if (!isLoading && !user) navigate("/auth");
    }, [user, isLoading, navigate]);

    if (!user || dashboard.loading) {
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
                {files.cover ? (
                    <div className="relative h-full">
                        <img
                            src={URL.createObjectURL(files.cover)}
                            className="w-full h-full object-cover"
                            alt="Preview cover"
                        />
                        {!user?.isGoogleUser && (
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleFileUpload("cover")}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                                    disabled={uploadState.loading}
                                >
                                    {uploadState.loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                                <button
                                    onClick={() =>
                                        setFiles((prev) => ({
                                            ...prev,
                                            cover: null,
                                        }))
                                    }
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
                                        setFiles((prev) => ({
                                            ...prev,
                                            cover: e.target.files[0],
                                        }))
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
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                    <div className="relative -mt-20">
                        {files.avatar ? (
                            <div className="relative">
                                <img
                                    src={URL.createObjectURL(files.avatar)}
                                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                                    alt="Preview"
                                />
                                {!user?.isGoogleUser && (
                                    <div className="absolute bottom-0 right-0 flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleFileUpload("avatar")
                                            }
                                            className="bg-blue-600 text-white p-1 rounded-full text-xs hover:bg-blue-700 disabled:opacity-50"
                                            disabled={uploadState.loading}
                                        >
                                            {uploadState.loading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                "✓"
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setFiles((prev) => ({
                                                    ...prev,
                                                    avatar: null,
                                                }))
                                            }
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
                                                setFiles((prev) => ({
                                                    ...prev,
                                                    avatar: e.target.files[0],
                                                }))
                                            }
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user.fullName}
                            </h1>
                            {user?.isVerified && (
                                <svg
                                    className="w-5 h-5 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </div>

                        <p className="text-gray-600">@{user.username}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            {user.email && (
                                <div className="flex items-center gap-1">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>{user.email}</span>
                                </div>
                            )}

                            {user?.createdAt && (
                                <div className="flex items-center gap-1">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>
                                        Joined{" "}
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {user?.bio && (
                            <p className="mt-4 text-gray-700">{user.bio}</p>
                        )}

                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="font-semibold">
                                    {user.followingCount || 0}
                                </span>
                                <span>Following</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="font-semibold">
                                    {user.followersCount || 0}
                                </span>
                                <span>Followers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {uploadState.error && (
                    <div className="text-red-500 text-sm mb-4">
                        Error: {uploadState.error}
                    </div>
                )}

                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="Tweets"
                        value={dashboard.data?.stats.tweetCount || 0}
                    />
                    <StatCard
                        title="Videos"
                        value={dashboard.data?.stats.videoCount || 0}
                    />
                    <StatCard
                        title="Watch Later"
                        value={dashboard.data?.stats.watchLaterCount || 0}
                    />
                    <StatCard
                        title="Likes"
                        value={dashboard.data?.stats.likeCount || 0}
                    />
                    <StatCard
                        title="Comments"
                        value={dashboard.data?.stats.commentCount || 0}
                    />
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {dashboard.data?.tweets?.length > 0 && (
                        <ContentSection
                            title="Recent Tweets"
                            items={dashboard.data.tweets}
                            renderItem={(tweet) => (
                                <TweetItem key={tweet._id} tweet={tweet} />
                            )}
                        />
                    )}

                    {dashboard.data?.videos?.length > 0 && (
                        <ContentSection
                            title="Recent Videos"
                            items={dashboard.data.videos}
                            renderItem={(video) => (
                                <VideoItem key={video._id} video={video} />
                            )}
                        />
                    )}

                    {dashboard.data?.watchLater?.length > 0 && (
                        <ContentSection
                            title="Watch Later"
                            items={dashboard.data.watchLater}
                            renderItem={(video) => (
                                <VideoItem key={video._id} video={video} />
                            )}
                        />
                    )}
                </div>

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

// StatCard Component
const StatCard = ({ title = "Default Title", value = 0 }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
);

// ContentSection Component
const ContentSection = ({ title, items = [], renderItem }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(renderItem)}
        </div>
    </div>
);

// TweetItem Component
const TweetItem = ({
    tweet = {
        content: "No content available",
        createdAt: new Date().toISOString(),
    },
}) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-800">{tweet.content}</p>
        <p className="text-sm text-gray-500 mt-2">
            {new Date(tweet.createdAt).toLocaleDateString()}
        </p>
    </div>
);

// VideoItem Component
const VideoItem = ({
    video = {
        title: "Untitled Video",
        description: "No description available",
        views: 0,
        createdAt: new Date().toISOString(),
    },
}) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-800">{video.title}</h3>
        <p className="text-sm text-gray-600">{video.description}</p>
        <p className="text-sm text-gray-500 mt-2">
            {video.views} views •{" "}
            {new Date(video.createdAt).toLocaleDateString()}
        </p>
    </div>
);

// PropTypes Validation
StatCard.propTypes = {
    title: PropTypes.string,
    value: PropTypes.number,
};

ContentSection.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
        })
    ),
    renderItem: PropTypes.func.isRequired,
};

TweetItem.propTypes = {
    tweet: PropTypes.shape({
        _id: PropTypes.string,
        content: PropTypes.string,
        createdAt: PropTypes.string,
    }),
};

VideoItem.propTypes = {
    video: PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        views: PropTypes.number,
        createdAt: PropTypes.string,
    }),
};

export default Profile;