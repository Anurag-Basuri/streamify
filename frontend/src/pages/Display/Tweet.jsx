// Tweet.jsx - Tweet Creation/View Page
import React, { useState, useEffect } from "react";
import { FaTwitter, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const Tweet = () => {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const { data } = await axios.get("/api/v1/tweets");
                setTweets(data.tweets);
            } catch (err) {
                setError("Failed to fetch tweets");
            } finally {
                setLoading(false);
            }
        };
        fetchTweets();
    }, []);

    const handleTweetSubmit = async (e) => {
        e.preventDefault();
        if (!newTweet.trim()) return;

        try {
            const { data } = await axios.post("/api/v1/tweets", {
                content: newTweet,
            });
            setTweets([data.tweet, ...tweets]);
            setNewTweet("");
        } catch (err) {
            setError("Failed to post tweet");
        }
    };

    const deleteTweet = async (id) => {
        if (window.confirm("Delete this tweet?")) {
            try {
                await axios.delete(`/api/v1/tweets/${id}`);
                setTweets(tweets.filter((t) => t._id !== id));
            } catch (err) {
                setError("Failed to delete tweet");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center gap-3">
                    <FaTwitter className="text-blue-500 text-3xl" />
                    <h1 className="text-3xl font-bold">Your Tweets</h1>
                </div>

                <form onSubmit={handleTweetSubmit} className="mb-8">
                    <textarea
                        value={newTweet}
                        onChange={(e) => setNewTweet(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full bg-gray-800 rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500"
                        maxLength={280}
                    />
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-gray-400">
                            {newTweet.length}/280
                        </span>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                        >
                            Tweet
                        </button>
                    </div>
                </form>

                {error && <div className="text-red-400 mb-4">{error}</div>}

                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse bg-gray-800 h-32 rounded-lg"
                            />
                        ))
                    ) : tweets.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            No tweets yet. Start tweeting!
                        </div>
                    ) : (
                        tweets.map((tweet) => (
                            <div
                                key={tweet._id}
                                className="bg-gray-800 rounded-lg p-4"
                            >
                                <p className="mb-4">{tweet.content}</p>
                                <div className="flex justify-between items-center text-gray-400 text-sm">
                                    <span>
                                        {new Date(
                                            tweet.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-3">
                                        <button className="hover:text-blue-400">
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() =>
                                                deleteTweet(tweet._id)
                                            }
                                            className="hover:text-red-400"
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

export default Tweet;
