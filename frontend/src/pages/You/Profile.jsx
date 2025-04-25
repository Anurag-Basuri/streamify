import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { updateAvatar, updateCoverImage } from "../../services/authService.js";
import useAuth from "../../hooks/useAuth.js";
import axios from "axios";
import {
    UserHeader,
    UserStats,
    UserContent,
    ImageUpload,
} from "../../components/Profile";
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
