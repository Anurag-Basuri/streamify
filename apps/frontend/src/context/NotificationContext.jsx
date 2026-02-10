/**
 * Notification Context - Enhanced
 * Industry-grade notification system with real-time updates,
 * optimistic UI, pagination, and robust error handling
 */
import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import * as notificationService from "../services/notificationService";
import { API_CONFIG } from "../config/api.config";

// ============================================================================
// CONSTANTS
// ============================================================================

const SOCKET_EVENTS = {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",
    RECONNECT_ATTEMPT: "reconnect_attempt",
    NEW_NOTIFICATION: "notification:new",
    USER_JOIN: "user:join",
    USER_LEAVE: "user:leave",
};

const NOTIFICATION_TYPES = {
    LIKE: "like",
    COMMENT: "comment",
    SUBSCRIBE: "subscribe",
    UPLOAD: "upload",
    SYSTEM: "system",
};

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes fallback
const MAX_CACHED_NOTIFICATIONS = 100;
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

// ============================================================================
// ACTION TYPES
// ============================================================================

const ACTIONS = {
    SET_LOADING: "SET_LOADING",
    SET_NOTIFICATIONS: "SET_NOTIFICATIONS",
    ADD_NOTIFICATION: "ADD_NOTIFICATION",
    UPDATE_NOTIFICATION: "UPDATE_NOTIFICATION",
    REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
    MARK_AS_READ: "MARK_AS_READ",
    MARK_ALL_READ: "MARK_ALL_READ",
    CLEAR_ALL: "CLEAR_ALL",
    SET_CONNECTION_STATUS: "SET_CONNECTION_STATUS",
    SET_ERROR: "SET_ERROR",
    SET_PAGINATION: "SET_PAGINATION",
    APPEND_NOTIFICATIONS: "APPEND_NOTIFICATIONS",
};

// ============================================================================
// REDUCER
// ============================================================================

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    isConnected: false,
    connectionStatus: "disconnected", // 'connected' | 'connecting' | 'disconnected' | 'error'
    pagination: {
        page: 1,
        totalPages: 1,
        totalDocs: 0,
        hasNextPage: false,
    },
    lastFetched: null,
};

function notificationReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case ACTIONS.SET_NOTIFICATIONS: {
            const notifications = action.payload.slice(
                0,
                MAX_CACHED_NOTIFICATIONS
            );
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter((n) => !n.read).length,
                loading: false,
                error: null,
                lastFetched: Date.now(),
            };
        }

        case ACTIONS.APPEND_NOTIFICATIONS: {
            const combined = [...state.notifications, ...action.payload];
            const unique = combined.filter(
                (n, i, arr) => arr.findIndex((x) => x._id === n._id) === i
            );
            return {
                ...state,
                notifications: unique.slice(0, MAX_CACHED_NOTIFICATIONS),
                loading: false,
            };
        }

        case ACTIONS.ADD_NOTIFICATION: {
            // Prevent duplicates
            if (state.notifications.some((n) => n._id === action.payload._id)) {
                return state;
            }
            const notifications = [
                action.payload,
                ...state.notifications,
            ].slice(0, MAX_CACHED_NOTIFICATIONS);
            return {
                ...state,
                notifications,
                unreadCount: state.unreadCount + (action.payload.read ? 0 : 1),
            };
        }

        case ACTIONS.UPDATE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.map((n) =>
                    n._id === action.payload._id
                        ? { ...n, ...action.payload }
                        : n
                ),
            };

        case ACTIONS.REMOVE_NOTIFICATION: {
            const target = state.notifications.find(
                (n) => n._id === action.payload
            );
            const unreadDelta = target && !target.read ? -1 : 0;
            return {
                ...state,
                notifications: state.notifications.filter(
                    (n) => n._id !== action.payload
                ),
                unreadCount: Math.max(0, state.unreadCount + unreadDelta),
            };
        }

        case ACTIONS.MARK_AS_READ: {
            const target = state.notifications.find(
                (n) => n._id === action.payload
            );
            if (!target || target.read) return state;
            return {
                ...state,
                notifications: state.notifications.map((n) =>
                    n._id === action.payload ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        }

        case ACTIONS.MARK_ALL_READ:
            return {
                ...state,
                notifications: state.notifications.map((n) => ({
                    ...n,
                    read: true,
                })),
                unreadCount: 0,
            };

        case ACTIONS.CLEAR_ALL:
            return { ...state, notifications: [], unreadCount: 0 };

        case ACTIONS.SET_CONNECTION_STATUS:
            return {
                ...state,
                connectionStatus: action.payload,
                isConnected: action.payload === "connected",
            };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };

        case ACTIONS.SET_PAGINATION:
            return {
                ...state,
                pagination: { ...state.pagination, ...action.payload },
            };

        default:
            return state;
    }
}

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const socketRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // ========================================================================
    // FETCH NOTIFICATIONS
    // ========================================================================

    const fetchNotifications = useCallback(
        async ({ page = 1, silent = false, append = false } = {}) => {
            if (!isAuthenticated) {
                dispatch({ type: ACTIONS.SET_NOTIFICATIONS, payload: [] });
                return;
            }

            if (!silent) {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            }

            try {
                const data = await notificationService.getNotifications({
                    page,
                    limit: 20,
                });
                const list = Array.isArray(data) ? data : data.docs || [];

                dispatch({
                    type: append
                        ? ACTIONS.APPEND_NOTIFICATIONS
                        : ACTIONS.SET_NOTIFICATIONS,
                    payload: list,
                });

                if (data.totalPages !== undefined) {
                    dispatch({
                        type: ACTIONS.SET_PAGINATION,
                        payload: {
                            page: data.page || page,
                            totalPages: data.totalPages,
                            totalDocs: data.totalDocs,
                            hasNextPage: data.hasNextPage,
                        },
                    });
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
                if (!silent) {
                    dispatch({
                        type: ACTIONS.SET_ERROR,
                        payload: error.message,
                    });
                }
            }
        },
        [isAuthenticated]
    );

    const loadMore = useCallback(async () => {
        if (state.pagination.hasNextPage && !state.loading) {
            await fetchNotifications({
                page: state.pagination.page + 1,
                silent: true,
                append: true,
            });
        }
    }, [fetchNotifications, state.pagination, state.loading]);

    // ========================================================================
    // NOTIFICATION ACTIONS (with optimistic updates)
    // ========================================================================

    const markRead = useCallback(async (id) => {
        // Optimistic update
        dispatch({ type: ACTIONS.MARK_AS_READ, payload: id });
        try {
            await notificationService.markAsRead(id);
        } catch (error) {
            // Rollback on error
            dispatch({
                type: ACTIONS.UPDATE_NOTIFICATION,
                payload: { _id: id, read: false },
            });
            throw error;
        }
    }, []);

    const markAllRead = useCallback(async () => {
        const previousNotifications = [...state.notifications];
        // Optimistic update
        dispatch({ type: ACTIONS.MARK_ALL_READ });
        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            // Rollback on error
            dispatch({
                type: ACTIONS.SET_NOTIFICATIONS,
                payload: previousNotifications,
            });
            throw error;
        }
    }, [state.notifications]);

    const removeNotification = useCallback(
        async (id) => {
            const notification = state.notifications.find((n) => n._id === id);
            // Optimistic update
            dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
            try {
                await notificationService.deleteNotification(id);
            } catch (error) {
                // Rollback on error
                if (notification) {
                    dispatch({
                        type: ACTIONS.ADD_NOTIFICATION,
                        payload: notification,
                    });
                }
                throw error;
            }
        },
        [state.notifications]
    );

    const clearAll = useCallback(async () => {
        const previousNotifications = [...state.notifications];
        // Optimistic update
        dispatch({ type: ACTIONS.CLEAR_ALL });
        try {
            await notificationService.clearAllNotifications();
        } catch (error) {
            // Rollback on error
            dispatch({
                type: ACTIONS.SET_NOTIFICATIONS,
                payload: previousNotifications,
            });
            throw error;
        }
    }, [state.notifications]);

    // ========================================================================
    // SOCKET CONNECTION
    // ========================================================================

    const connectSocket = useCallback(() => {
        if (!isAuthenticated || !user?._id || socketRef.current?.connected) {
            return;
        }

        dispatch({
            type: ACTIONS.SET_CONNECTION_STATUS,
            payload: "connecting",
        });

        const socket = io(API_CONFIG.baseURL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            timeout: 20000,
        });

        socketRef.current = socket;

        socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log("🔌 Notification socket connected");
            dispatch({
                type: ACTIONS.SET_CONNECTION_STATUS,
                payload: "connected",
            });
            socket.emit(SOCKET_EVENTS.USER_JOIN, user._id);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log("🔌 Socket disconnected:", reason);
            dispatch({
                type: ACTIONS.SET_CONNECTION_STATUS,
                payload: "disconnected",
            });
            // If server disconnected, try to reconnect
            if (reason === "io server disconnect") {
                reconnectTimeoutRef.current = setTimeout(
                    () => socket.connect(),
                    1000
                );
            }
        });

        socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
            console.error("Socket connection error:", error.message);
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: "error" });
        });

        socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}`);
            dispatch({
                type: ACTIONS.SET_CONNECTION_STATUS,
                payload: "connecting",
            });
        });

        socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification) => {
            console.log("📬 New notification:", notification);
            dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
            // Dispatch custom event for toast/sound handling
            window.dispatchEvent(
                new CustomEvent("notification:received", {
                    detail: notification,
                })
            );
        });

        return socket;
    }, [isAuthenticated, user?._id]);

    const disconnectSocket = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (socketRef.current) {
            if (user?._id) {
                socketRef.current.emit(SOCKET_EVENTS.USER_LEAVE, user._id);
            }
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        dispatch({
            type: ACTIONS.SET_CONNECTION_STATUS,
            payload: "disconnected",
        });
    }, [user?._id]);

    // ========================================================================
    // EFFECTS
    // ========================================================================

    // Initial fetch and socket connection
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            connectSocket();
        } else {
            disconnectSocket();
            dispatch({ type: ACTIONS.SET_NOTIFICATIONS, payload: [] });
        }
        return () => disconnectSocket();
    }, [isAuthenticated, fetchNotifications, connectSocket, disconnectSocket]);

    // Fallback polling (when socket is disconnected)
    useEffect(() => {
        if (!isAuthenticated) return;

        pollIntervalRef.current = setInterval(() => {
            // Only poll if socket is not connected
            if (!socketRef.current?.connected) {
                fetchNotifications({ silent: true });
            }
        }, POLL_INTERVAL);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [isAuthenticated, fetchNotifications]);

    // Visibility change handler - refresh when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && isAuthenticated) {
                // Refresh if data is stale
                const isStale =
                    Date.now() - (state.lastFetched || 0) > STALE_TIME;
                if (isStale) {
                    fetchNotifications({ silent: true });
                }
                // Reconnect socket if disconnected
                if (!socketRef.current?.connected) {
                    connectSocket();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
    }, [isAuthenticated, fetchNotifications, connectSocket, state.lastFetched]);

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================

    const groupedNotifications = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };

        state.notifications.forEach((notification) => {
            const date = new Date(notification.createdAt);
            if (date >= today) {
                groups.today.push(notification);
            } else if (date >= yesterday) {
                groups.yesterday.push(notification);
            } else if (date >= weekAgo) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    }, [state.notifications]);

    const notificationsByType = useMemo(() => {
        return state.notifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1;
            return acc;
        }, {});
    }, [state.notifications]);

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================

    const value = useMemo(
        () => ({
            // State
            notifications: state.notifications,
            unreadCount: state.unreadCount,
            loading: state.loading,
            error: state.error,
            isConnected: state.isConnected,
            connectionStatus: state.connectionStatus,
            pagination: state.pagination,

            // Computed
            groupedNotifications,
            notificationsByType,

            // Actions
            refresh: fetchNotifications,
            loadMore,
            markRead,
            markAllRead,
            removeNotification,
            clearAll,

            // Socket
            reconnect: connectSocket,
        }),
        [
            state,
            groupedNotifications,
            notificationsByType,
            fetchNotifications,
            loadMore,
            markRead,
            markAllRead,
            removeNotification,
            clearAll,
            connectSocket,
        ]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// ============================================================================
// HOOK
// ============================================================================

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within NotificationProvider"
        );
    }
    return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export { NOTIFICATION_TYPES, SOCKET_EVENTS };
export default NotificationContext;
