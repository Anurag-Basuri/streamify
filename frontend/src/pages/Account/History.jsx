import { useState, useEffect } from "react";
import { FaClock, FaTrash } from "react-icons/fa";

function History() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Fetch history data from backend or local storage
        const fetchHistory = async () => {
            try {
                const response = await fetch("/api/history"); // Update with actual API
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        fetchHistory();
    }, []);

    const removeHistoryItem = (id) => {
        setHistory((prevHistory) =>
            prevHistory.filter((item) => item.id !== id)
        );

        // Optionally, send request to backend to remove item
        fetch(`/api/history/${id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then((data) => console.log("Deleted:", data))
            .catch((error) => console.error("Error deleting item:", error));
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-white">Watch History</h2>

            {history.length === 0 ? (
                <p className="text-gray-400 mt-4">No history available.</p>
            ) : (
                <ul className="mt-4 space-y-4">
                    {history.map((item) => (
                        <li
                            key={item.id}
                            className="flex justify-between items-center p-4 bg-gray-800 rounded-lg shadow-md"
                        >
                            <div className="flex flex-col">
                                <span className="text-gray-300">
                                    {item.videoTitle}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <FaClock />{" "}
                                    {new Date(
                                        item.watchedAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                onClick={() => removeHistoryItem(item.id)}
                                className="hover:text-red-400"
                            >
                                <FaTrash />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default History;
