// Animation Variants
// Centralized animation configurations for consistent UX across the app

// ============================================================================
// CONTAINER ANIMATIONS
// ============================================================================

// Staggered container animation - children appear one by one
export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 },
    },
};

/**
 * Fast stagger for lists
 */
export const fastStaggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05,
        },
    },
};

// ============================================================================
// ITEM ANIMATIONS
// ============================================================================

/**
 * Fade up animation for list items
 */
export const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
};

/**
 * Fade in animation (no movement)
 */
export const fadeItem = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
};

/**
 * Scale up animation
 */
export const scaleItem = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

/**
 * Slide animation for page/modal transitions
 * @param {number} direction - 1 for right, -1 for left
 */
export const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
    }),
};

/**
 * Fade with slight scale for modals
 */
export const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 10,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.15 },
    },
};

/**
 * Overlay/backdrop animation
 */
export const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

// ============================================================================
// HOVER & TAP ANIMATIONS
// ============================================================================

/**
 * Standard button hover/tap
 */
export const buttonTap = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
};

/**
 * Icon button hover/tap
 */
export const iconButtonTap = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
};

/**
 * Subtle hover effect
 */
export const subtleHover = {
    hover: { scale: 1.01 },
    tap: { scale: 0.99 },
};

// ============================================================================
// SPRING CONFIGS
// ============================================================================

/**
 * Standard spring for most animations
 */
export const standardSpring = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};

/**
 * Snappy spring for quick responses
 */
export const snappySpring = {
    type: "spring",
    stiffness: 500,
    damping: 30,
};

/**
 * Smooth spring for fluid motion
 */
export const smoothSpring = {
    type: "spring",
    stiffness: 200,
    damping: 25,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create stagger delay for manual staggering
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay in seconds
 */
export const staggerDelay = (index, baseDelay = 0.05) => ({
    delay: index * baseDelay,
});

/**
 * Combine multiple animation variants
 */
export const combineVariants = (...variants) => {
    const combined = {};
    variants.forEach((variant) => {
        Object.keys(variant).forEach((key) => {
            combined[key] = { ...combined[key], ...variant[key] };
        });
    });
    return combined;
};

export default {
    staggerContainer,
    fastStaggerContainer,
    fadeUpItem,
    fadeItem,
    scaleItem,
    slideVariants,
    modalVariants,
    overlayVariants,
    buttonTap,
    iconButtonTap,
    subtleHover,
    standardSpring,
    snappySpring,
    smoothSpring,
    staggerDelay,
    combineVariants,
};
