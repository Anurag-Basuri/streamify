/**
 * Utils Index
 * Central export for all utility functions
 *
 * Usage:
 * import { formatDuration, formatCount, videoGrid } from '@/utils';
 */

// ============================================================================
// ANIMATIONS
// ============================================================================

export {
    // Container variants
    staggerContainer,
    fastStaggerContainer,

    // Item variants
    fadeUpItem,
    fadeItem,
    scaleItem,

    // Slide/Modal variants
    slideVariants,
    modalVariants,
    overlayVariants,

    // Button interactions
    buttonTap,
    iconButtonTap,
    subtleHover,

    // Spring configurations
    standardSpring,
    snappySpring,
    smoothSpring,

    // Utility functions
    staggerDelay,
    combineVariants,
} from "./animations";

// ============================================================================
// RESPONSIVE
// ============================================================================

export {
    BREAKPOINTS,
    videoGrid,
    contentGrid,
    contentGridWide,
    sidebarLayout,
    pageContainer,
    sectionSpacing,
    cardPadding,
    pageTitle,
    sectionTitle,
    cardTitle,
    bodyText,
    smallText,
    buttonSizes,
    hideOnMobile,
    showOnMobile,
    stackToRow,
    stackToRowMd,
    stackToRowLg,
    videoPlayerContainer,
    heroContainer,
    avatarSizes,
    gapSizes,
    modalContainer,
    modalContent,
    drawerContent,
    matchesBreakpoint,
    getCurrentBreakpoint,
} from "./responsive";

// ============================================================================
// THEME
// ============================================================================

export * from "./theme";

// ============================================================================
// FORMATTERS
// ============================================================================

export { formatDuration } from "./formatters";

// ============================================================================
// ADDITIONAL FORMATTERS
// ============================================================================

/**
 * Format a number with K/M/B suffix
 */
export const formatCount = (num) => {
    if (!num || num < 0) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now - target;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0)
        return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    if (diffMonths > 0)
        return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    if (diffWeeks > 0)
        return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    return "Just now";
};

/**
 * Format bytes to human readable size
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
};

/**
 * Slugify a string
 */
export const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

/**
 * Generate a random ID
 */
export const generateId = (length = 8) => {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
};

/**
 * Debounce function
 */
export const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Throttle function
 */
export const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
    if (value == null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};
