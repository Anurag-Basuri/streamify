import React, { useState, useEffect } from "react";
import { FaDownload, FaTrash, FaPlayCircle } from "react-icons/fa";
import axios from "axios";

const Download = () => {
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDownloads = async () => {
            try {
                const { data } = await axios.get("/api/v1/downloads");
                setDownloads(data.downloads);
            } catch (err) {
                setError("Failed to fetch downloads");
            } finally {
                setLoading(false);
            }
        };
        fetchDownloads();
    }, []);

    const removeDownload = async (id) => {
        try {
            await axios.delete(`/api/v1/downloads/${id}`);
            setDownloads(downloads.filter((d) => d._id !== id));
        } catch (err) {
            setError("Failed to remove download");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaDownload className="text-blue-500" />
                        Downloaded Videos
                    </h1>
                </div>

                {error && <div className="text-red-400 mb-4">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse bg-gray-800 h-64 rounded-xl"
                            />
                        ))
                    ) : downloads.length === 0 ? (
                        <div className="col-span-full text-center text-gray-400 py-12">
                            No downloaded videos found
                        </div>
                    ) : (
                        downloads.map((item) => (
                            <div
                                key={item._id}
                                className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-all"
                            >
                                <div className="relative">
                                    <img
                                        src={item.video.thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                        <FaPlayCircle className="text-4xl text-white" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold truncate">
                                        {item.video.title}
                                    </h3>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-sm text-gray-400">
                                            {new Date(
                                                item.downloadedAt
                                            ).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() =>
                                                removeDownload(item._id)
                                            }
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Download;
