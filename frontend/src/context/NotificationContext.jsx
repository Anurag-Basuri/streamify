import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from "../services/notificationService";
import { showError, showSuccess } from "../components/Common/ToastProvider";
import { API_CONFIG } from "../config/api.config";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

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

    // Initial load and polling (fallback)
    useEffect(() => {
        loadNotifications();

        // Poll every 5 minutes as fallback (Socket.io is primary)
        const interval = setInterval(() => {
            if (isAuthenticated) loadNotifications(true);
        }, 300000);

        return () => clearInterval(interval);
    }, [loadNotifications, isAuthenticated]);

    // Socket.io connection for real-time notifications
    useEffect(() => {
        if (!isAuthenticated || !user?._id) {
            // Disconnect if not authenticated
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        const socket = io(API_CONFIG.baseURL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("🔌 Socket connected");
            setIsConnected(true);
            // Join user-specific room
            socket.emit("user:join", user._id);
        });

        socket.on("disconnect", (reason) => {
            console.log("🔌 Socket disconnected:", reason);
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            setIsConnected(false);
        });

        // Handle incoming notifications
        socket.on("notification:new", (notification) => {
            console.log("📬 New notification received:", notification);
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show toast for new notification
            showSuccess(notification.message, { duration: 4000 });
        });

        return () => {
            if (socket) {
                socket.emit("user:leave", user._id);
                socket.disconnect();
            }
        };
    }, [isAuthenticated, user?._id]);

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
                isConnected,
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
