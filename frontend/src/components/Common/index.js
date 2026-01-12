/**
 * Common Components Index
 * Central export for all common/shared components
 */

// Toast notifications
export { default as ToastProvider } from "./ToastProvider";
export {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateToast,
    dismissToast,
    dismissAllToasts,
    promiseToast,
    toast,
} from "./ToastProvider";

// Page transitions
export { default as PageTransition } from "./PageTransition";

// Empty states
export { default as EmptyState } from "./EmptyState";

// Error handling
export { default as ErrorBoundary } from "./ErrorBoundary";
