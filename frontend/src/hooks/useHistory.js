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
        if (!user?.token) {
            setHistory([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/v1/history", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Couldn't fetch history");
            // Always set to array of items
            setHistory(data.data?.videos || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Add a video to history
    const addToHistory = async (videoId) => {
        if (!user?.token) return;
        try {
            const response = await fetch(`/api/v1/history/add/${videoId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to add to history");
            // Refetch to ensure correct order and no duplicates
            await fetchHistory();
        } catch (err) {
            setError(err.message);
        }
    };

    // Remove a video from history
    const removeFromHistory = async (videoId) => {
        if (!user?.token) return;
        try {
            const response = await fetch(`/api/v1/history/${videoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(
                    data.message || "Failed to remove from history"
                );
            setHistory(data.data?.videos || []);
            setRemovingId(null);
        } catch (err) {
            setError(err.message);
            setRemovingId(null);
        }
    };

    // Clear entire watch history
    const clearHistory = async () => {
        if (!user?.token) return;
        try {
            const response = await fetch("/api/v1/history/clear", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to clear history");
            setHistory([]);
            setShowClearModal(false);
        } catch (err) {
            setError(err.message);
            setShowClearModal(false);
        }
    };

    // Group history by date
    const groupHistoryByDate = (historyArr = history) => {
        return (historyArr || []).reduce((acc, item) => {
            if (!item || !item.watchedAt) return acc;
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
        fetchHistory();
    }, [fetchHistory]);

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
        groupHistoryByDate,
        addToHistory,
        fetchHistory,
    };
};

export default useHistory;
