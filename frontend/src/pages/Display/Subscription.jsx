// Subscription.jsx - Subscribed Channels Page
import React, { useState, useEffect } from "react";
import { FaUserPlus, FaVideo } from "react-icons/fa";
import axios from "axios";

const Subscription = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const { data } = await axios.get("/api/v1/subscriptions");
                setSubscriptions(data.subscriptions);
            } catch (err) {
                setError("Failed to fetch subscriptions");
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FaUserPlus className="text-green-500" />
                    Subscribed Channels
                </h1>

                {error && <div className="text-red-400 mb-4">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse bg-gray-800 h-48 rounded-xl"
                            />
                        ))
                    ) : subscriptions.length === 0 ? (
                        <div className="col-span-full text-center text-gray-400 py-12">
                            No subscribed channels
                        </div>
                    ) : (
                        subscriptions.map((channel) => (
                            <div
                                key={channel._id}
                                className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-750 transition-all"
                            >
                                <img
                                    src={channel.avatar}
                                    alt="Channel Avatar"
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                                />
                                <h3 className="font-semibold text-xl mb-2">
                                    {channel.name}
                                </h3>
                                <div className="flex items-center justify-center gap-4 text-gray-400">
                                    <FaVideo /> {channel.videoCount} videos
                                </div>
                                <button className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg w-full transition-colors">
                                    View Channel
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Subscription;
