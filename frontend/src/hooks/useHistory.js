import { useState, useEffect, useCallback } from 'react';
import { isToday, isYesterday, subDays, format } from 'date-fns';

const useHistory = (user) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);

    // Fetch user's watch history
    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch("/api/v1/history", {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Couldn't fetch history");
            setHistory(data.data?.videos || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Remove a video from history
    const removeFromHistory = async (videoId) => {
        try {
            const response = await fetch(`/api/v1/history/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to remove from history");
            setHistory((prev) => prev.filter((item) => item.video._id !== videoId));
            setRemovingId(null);
        } catch (err) {
            setError(err.message);
            setRemovingId(null);
        }
    };

    // Clear entire watch history
    const clearHistory = async () => {
        try {
            const response = await fetch("/api/v1/history/clear", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to clear history");
            setHistory([]);
            setShowClearModal(false);
        } catch (err) {
            setError(err.message);
            setShowClearModal(false);
        }
    };

    // Group history by date
    const groupHistoryByDate = () => {
        return history.reduce((acc, item) => {
            const date = new Date(item.watchedAt);
            let group;

            if (isToday(date)) {
                group = "Today";
            } else if (isYesterday(date)) {
                group = "Yesterday";
            } else if (date > subDays(new Date(), 7)) {
                group = "This Week";
            } else {
                group = format(date, "MMMM yyyy");
            }

            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {});
    };

    useEffect(() => {
        if (user) fetchHistory();
    }, [user, fetchHistory]);

    return {
        history,
        loading,
        error,
        removingId,
        showClearModal,
        setRemovingId,
        setShowClearModal,
        removeFromHistory,
        clearHistory,
        groupHistoryByDate
    };
};

export default useHistory;
