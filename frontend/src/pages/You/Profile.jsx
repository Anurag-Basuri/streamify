import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { updateAvatar, updateCoverImage } from "../../services/authService.js";
import useAuth from "../../hooks/useAuth.js";
import axios from "axios";
import { Fragment } from 'react';
import PropTypes from 'prop-types';

export const UserHeader = ({ user, files, setFiles, uploadState, handleFileUpload }) => {
    return (
        <div className="flex items-center gap-8 mb-8">
            <div className="relative">
                <img
                    src={files.avatar ? URL.createObjectURL(files.avatar) : user.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                />
                {!user.isGoogleUser && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFiles(prev => ({ ...prev, avatar: e.target.files[0] }))}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                )}
            </div>
            <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                {files.avatar && (
                    <button
                        onClick={() => handleFileUpload('avatar')}
                        disabled={uploadState.loading}
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md"
                    >
                        {uploadState.loading ? 'Uploading...' : 'Update Avatar'}
                    </button>
                )}
            </div>
        </div>
    );
};

UserHeader.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        isGoogleUser: PropTypes.bool
    }).isRequired,
    files: PropTypes.shape({
        avatar: PropTypes.object
    }).isRequired,
    setFiles: PropTypes.func.isRequired,
    uploadState: PropTypes.shape({
        loading: PropTypes.bool.isRequired,
        error: PropTypes.string
    }).isRequired,
    handleFileUpload: PropTypes.func.isRequired
};

export const UserStats = ({ stats }) => {
    if (!stats) return null;
    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold capitalize">{key}</h3>
                    <p className="text-xl">{value}</p>
                </div>
            ))}
        </div>
    );
};

export const UserContent = ({ content }) => {
    if (!content) return null;
    return (
        <div className="space-y-6">
            {/* Add your content sections here based on your dashboard data structure */}
            <p className="text-gray-600">User content will be displayed here</p>
        </div>
    );
};

export const ImageUpload = ({ type, image, file, setFiles, handleUpload, uploadState, isGoogleUser }) => {
    return (
        <div className="relative h-64 bg-gray-100">
            <img
                src={file ? URL.createObjectURL(file) : image}
                alt={type}
                className="w-full h-full object-cover"
            />
            {!isGoogleUser && (
                <Fragment>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFiles(prev => ({ ...prev, [type]: e.target.files[0] }))}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {file && (
                        <button
                            onClick={() => handleUpload(type)}
                            disabled={uploadState.loading}
                            className="absolute bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                            {uploadState.loading ? 'Uploading...' : `Update ${type}`}
                        </button>
                    )}
                </Fragment>
            )}
        </div>
    );
};

ImageUpload.propTypes = {
    type: PropTypes.string.isRequired,
    image: PropTypes.string,
    file: PropTypes.object,
    setFiles: PropTypes.func.isRequired,
    handleUpload: PropTypes.func.isRequired,
    uploadState: PropTypes.shape({
        loading: PropTypes.bool.isRequired,
        error: PropTypes.string
    }).isRequired,
    isGoogleUser: PropTypes.bool
};

import { LoadingSpinner } from "../../components/Common/LoadingSpinner.jsx";

const useAxios = () => {
    const instance = axios.create();

    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem("accessToken");
                window.location.href = "/auth";
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const Profile = () => {
    const { user, logout, isLoading, updateUser } = useAuth();
    const navigate = useNavigate();
    const axios = useAxios();

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
        error: null,
    });

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
                    error: error.message || "Failed to update image",
                }));
            } finally {
                setUploadState((prev) => ({ ...prev, loading: false }));
            }
        },
        [files, updateUser, user]
    );

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user || !localStorage.getItem("accessToken")) return;

            try {
                const { data } = await axios.get("/api/v1/dashboard");
                setDashboard({
                    data: data.data,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                setDashboard({
                    data: null,
                    loading: false,
                    error: error.message || "Failed to load dashboard",
                });
            }
        };

        fetchDashboard();
    }, [user, axios]);

    useEffect(() => {
        if (!isLoading && !user) navigate("/auth");
    }, [user, isLoading, navigate]);

    if (!user || dashboard.loading) {
        return <LoadingSpinner />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
        >
            <ImageUpload
                type="cover"
                image={user?.coverImage}
                file={files.cover}
                setFiles={setFiles}
                handleUpload={handleFileUpload}
                uploadState={uploadState}
                isGoogleUser={user?.isGoogleUser}
            />

            <div className="p-8">
                <UserHeader
                    user={user}
                    files={files}
                    setFiles={setFiles}
                    uploadState={uploadState}
                    handleFileUpload={handleFileUpload}
                />

                {uploadState.error && (
                    <div className="text-red-500 text-sm mb-4">
                        Error: {uploadState.error}
                    </div>
                )}

                <UserStats stats={dashboard.data?.stats} />
                <UserContent content={dashboard.data} />

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
