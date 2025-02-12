import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUserProfile,
    getWatchHistory,
    updateUser,
} from "../../services/authService.js"; // Adjusted named imports

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [watchHistory, setWatchHistory] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0,
    });

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        fullName: "",
    });

    // Fetch user details
    const fetchUser = async () => {
        try {
            const userData = await getUserProfile(); // Fetch user profile via auth service
            if (userData) {
                setUser(userData);
                setFormData({
                    userName: userData.userName || "",
                    email: userData.email || "",
                    fullName: userData.fullName || "",
                });
            } else {
                navigate("/auth"); // Redirect to the sign-in page if not authenticated
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            navigate("/auth");
        }
    };

    // Fetch watch history
    const fetchWatchHistory = async (page = 1) => {
        try {
            const response = await getWatchHistory(page, pagination.limit);
            setWatchHistory(response.items);
            setPagination({
                ...pagination,
                page,
                totalPages: response.totalPages,
                totalItems: response.totalItems,
            });
        } catch (error) {
            console.error("Error fetching watch history:", error);
        }
    };

    // Update user account details
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await updateUser(formData); // Use updateUser  from auth service
            setUser(updatedUser);
            setEditMode(false);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchWatchHistory(pagination.page);
        }
    }, [user, pagination.page]);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="p-8 border-b border-gray-100">
                <h3 className="text-xl font-semibold">Account Details</h3>
                <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    {editMode ? "Cancel" : "Edit"}
                </button>
            </div>

            {/* Account Details Section */}
            <div className="p-8">
                {editMode ? (
                    <form onSubmit={handleUpdateAccount} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.userName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        userName: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fullName: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Username:</span>{" "}
                            {user.userName}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span>{" "}
                            {user.email}
                        </p>
                        <p>
                            <span className="font-medium">Full Name:</span>{" "}
                            {user.fullName}
                        </p>
                    </div>
                )}
            </div>

            {/* Watch History Section */}
            <div className="p-8 border-t border-gray-100">
                <h3 className="text-xl font-semibold mb-6">Watch History</h3>
                {watchHistory.length === 0 ? (
                    <p className="text-gray-500">No watch history found</p>
                ) : (
                    <div className="space-y-4">
                        {watchHistory.map((video) => (
                            <div
                                key={video._id}
                                className="flex gap-4 hover:bg-gray-50 p-4 rounded-lg"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-32 h-20 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-medium">
                                        {video.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {video.owner.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            video.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        <div className="flex justify-center gap-2 mt-6">
                            {Array.from(
                                { length: pagination.totalPages },
                                (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => fetchWatchHistory(i + 1)}
                                        className={`px-3 py-1 rounded-md ${
                                            pagination.page === i + 1
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
