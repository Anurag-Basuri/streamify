/**
 * ToastProvider
 * Themed toast notifications using react-hot-toast
 */
import { Toaster, toast } from "react-hot-toast";
import { FiCheck, FiX, FiAlertCircle, FiInfo, FiLoader } from "react-icons/fi";

// ============================================================================
// TOAST CONFIGURATION
// ============================================================================

const toastOptions = {
    duration: 4000,
    position: "bottom-right",

    // Default styling
    style: {
        background: "var(--bg-elevated)",
        color: "var(--text-primary)",
        borderRadius: "12px",
        border: "1px solid var(--border-light)",
        padding: "12px 16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
        fontSize: "14px",
        maxWidth: "400px",
    },

    // Type-specific styling
    success: {
        duration: 3000,
        iconTheme: {
            primary: "var(--success)",
            secondary: "white",
        },
    },
    error: {
        duration: 5000,
        iconTheme: {
            primary: "var(--error)",
            secondary: "white",
        },
    },
};

// ============================================================================
// CUSTOM TOAST FUNCTIONS
// ============================================================================

/**
 * Show success toast
 */
export const showSuccess = (message, options = {}) => {
    return toast.success(message, {
        icon: <FiCheck className="w-5 h-5 text-[var(--success)]" />,
        ...options,
    });
};

/**
 * Show error toast
 */
export const showError = (message, options = {}) => {
    return toast.error(message, {
        icon: <FiX className="w-5 h-5 text-[var(--error)]" />,
        ...options,
    });
};

/**
 * Show warning toast
 */
export const showWarning = (message, options = {}) => {
    return toast(message, {
        icon: <FiAlertCircle className="w-5 h-5 text-[var(--warning)]" />,
        duration: 4000,
        ...options,
    });
};

/**
 * Show info toast
 */
export const showInfo = (message, options = {}) => {
    return toast(message, {
        icon: <FiInfo className="w-5 h-5 text-[var(--info)]" />,
        duration: 3000,
        ...options,
    });
};

/**
 * Show loading toast (returns toast ID for later dismissal)
 */
export const showLoading = (message = "Loading...", options = {}) => {
    return toast.loading(message, {
        icon: (
            <FiLoader className="w-5 h-5 text-[var(--brand-primary)] animate-spin" />
        ),
        ...options,
    });
};

/**
 * Update existing toast
 */
export const updateToast = (toastId, message, type = "success") => {
    const icons = {
        success: <FiCheck className="w-5 h-5 text-[var(--success)]" />,
        error: <FiX className="w-5 h-5 text-[var(--error)]" />,
        warning: <FiAlertCircle className="w-5 h-5 text-[var(--warning)]" />,
        info: <FiInfo className="w-5 h-5 text-[var(--info)]" />,
    };

    toast.success(message, {
        id: toastId,
        icon: icons[type] || icons.success,
    });
};

/**
 * Dismiss toast
 */
export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
    toast.dismiss();
};

/**
 * Promise toast - shows loading, then success/error based on promise result
 */
export const promiseToast = (promise, messages = {}) => {
    const {
        loading = "Loading...",
        success = "Success!",
        error = "Something went wrong",
    } = messages;

    return toast.promise(promise, {
        loading,
        success,
        error: (err) => err?.message || error,
    });
};

// ============================================================================
// TOASTER COMPONENT
// ============================================================================

const ToastProvider = () => {
    return (
        <Toaster
            position="bottom-right"
            reverseOrder={false}
            gutter={12}
            containerStyle={{
                bottom: 24,
                right: 24,
            }}
            toastOptions={toastOptions}
        />
    );
};

// Export both the provider and utility functions
export { toast };
export default ToastProvider;
