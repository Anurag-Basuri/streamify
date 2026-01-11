/**
 * Responsive Utilities
 * CSS classes and hooks for consistent responsive behavior
 */

// ============================================================================
// BREAKPOINT VALUES (matches Tailwind defaults)
// ============================================================================

export const BREAKPOINTS = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
};

// ============================================================================
// RESPONSIVE GRID CLASSES
// ============================================================================

// Video grid - responsive columns
export const videoGrid =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6";

// Content grid - 2/3 column layouts
export const contentGrid = "grid grid-cols-1 lg:grid-cols-3 gap-6";
export const contentGridWide =
    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6";

// Sidebar layout
export const sidebarLayout = "flex flex-col lg:flex-row gap-6";

// ============================================================================
// RESPONSIVE SPACING
// ============================================================================

// Page container with responsive padding
export const pageContainer = "px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8";

// Section spacing
export const sectionSpacing = "space-y-6 sm:space-y-8 lg:space-y-12";

// Card padding
export const cardPadding = "p-4 sm:p-6";

// ============================================================================
// RESPONSIVE TYPOGRAPHY
// ============================================================================

// Page titles
export const pageTitle = "text-2xl sm:text-3xl lg:text-4xl font-bold";

// Section titles
export const sectionTitle = "text-xl sm:text-2xl font-bold";

// Card titles
export const cardTitle = "text-base sm:text-lg font-semibold";

// Body text
export const bodyText = "text-sm sm:text-base";

// Small text
export const smallText = "text-xs sm:text-sm";

// ============================================================================
// RESPONSIVE BUTTON SIZES
// ============================================================================

export const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base",
    lg: "px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg",
};

// ============================================================================
// VISIBILITY HELPERS
// ============================================================================

export const hideOnMobile = "hidden sm:block";
export const showOnMobile = "block sm:hidden";
export const hideOnTablet = "hidden md:block";
export const showOnTablet = "block md:hidden";
export const hideOnDesktop = "hidden lg:block";
export const showOnDesktop = "block lg:hidden";

// ============================================================================
// RESPONSIVE FLEX LAYOUTS
// ============================================================================

// Stack on mobile, row on larger screens
export const stackToRow = "flex flex-col sm:flex-row";
export const stackToRowMd = "flex flex-col md:flex-row";
export const stackToRowLg = "flex flex-col lg:flex-row";

// Center on mobile, start on larger
export const centerToStart = "items-center sm:items-start";
export const centerToEnd = "items-center sm:items-end";

// ============================================================================
// RESPONSIVE IMAGE/VIDEO CONTAINERS
// ============================================================================

// Video player container
export const videoPlayerContainer =
    "w-full aspect-video rounded-xl overflow-hidden";

// Hero image with max height on mobile
export const heroContainer =
    "min-h-[50vh] sm:min-h-[60vh] lg:min-h-[80vh] max-h-screen";

// Avatar sizes
export const avatarSizes = {
    sm: "w-8 h-8 sm:w-10 sm:h-10",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24",
    xl: "w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32",
};

// ============================================================================
// RESPONSIVE GAP CLASSES
// ============================================================================

export const gapSizes = {
    sm: "gap-2 sm:gap-3",
    md: "gap-3 sm:gap-4 lg:gap-6",
    lg: "gap-4 sm:gap-6 lg:gap-8",
};

// ============================================================================
// MODAL/OVERLAY
// ============================================================================

export const modalContainer =
    "fixed inset-0 z-50 flex items-center justify-center p-4";
export const modalContent =
    "w-full max-w-sm sm:max-w-md lg:max-w-lg bg-[var(--bg-elevated)] rounded-2xl shadow-xl";
export const drawerContent =
    "fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-[var(--bg-elevated)] shadow-xl";

// ============================================================================
// MEDIA QUERY HOOK (for JS-based responsive logic)
// ============================================================================

/**
 * Check if current viewport matches a breakpoint
 * @param {string} breakpoint - One of: xs, sm, md, lg, xl, 2xl
 * @returns {boolean}
 */
export const matchesBreakpoint = (breakpoint) => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= BREAKPOINTS[breakpoint];
};

/**
 * Get current breakpoint name
 * @returns {string} Current breakpoint: xs, sm, md, lg, xl, 2xl
 */
export const getCurrentBreakpoint = () => {
    if (typeof window === "undefined") return "md";
    const width = window.innerWidth;

    if (width >= BREAKPOINTS["2xl"]) return "2xl";
    if (width >= BREAKPOINTS.xl) return "xl";
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "xs";
};

export default {
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
};
