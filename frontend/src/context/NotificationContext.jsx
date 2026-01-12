import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import useAuth from "../hooks/useAuth";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from "../services/notificationService";
import { showError } from "../components/Common/ToastProvider";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadNotifications = useCallback(
        async (silent = false) => {
            if (!isAuthenticated) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            if (!silent) setLoading(true);
            try {
                const data = await getNotifications();
                const list = Array.isArray(data) ? data : data.docs || [];
                setNotifications(list);
                setUnreadCount(list.filter((n) => !n.read).length);
            } catch (error) {
                console.error("Failed to load notifications:", error);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [isAuthenticated]
    );

    // Initial load and polling
    useEffect(() => {
        loadNotifications();

        // Poll every 60 seconds
        const interval = setInterval(() => {
            if (isAuthenticated) loadNotifications(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [loadNotifications, isAuthenticated]);

    const markRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            showError("Failed to mark as read");
            throw error;
        }
    };

    const markAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            showError("Failed to mark all as read");
            throw error;
        }
    };

    const removeNotification = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => {
                const target = prev.find((n) => n._id === id);
                if (target && !target.read)
                    setUnreadCount((c) => Math.max(0, c - 1));
                return prev.filter((n) => n._id !== id);
            });
        } catch (error) {
            showError("Failed to delete notification");
            throw error;
        }
    };

    const clearAll = async () => {
        try {
            await clearAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            showError("Failed to clear notifications");
            throw error;
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                refresh: loadNotifications,
                markRead,
                markAllRead,
                removeNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
};

export default NotificationContext;
