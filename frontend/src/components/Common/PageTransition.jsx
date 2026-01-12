/**
 * PageTransition
 * Smooth page transition wrapper using Framer Motion
 */
import { motion } from "framer-motion";
import PropTypes from "prop-types";

// ============================================================================
// TRANSITION VARIANTS
// ============================================================================

const variants = {
    // Fade transition
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },

    // Fade with slide up
    fadeUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },

    // Fade with slide down
    fadeDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
    },

    // Fade with scale
    fadeScale: {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
    },

    // Slide from right (for forward navigation)
    slideRight: {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    },

    // Slide from left (for back navigation)
    slideLeft: {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    },
};

// ============================================================================
// COMPONENT
// ============================================================================

const PageTransition = ({
    children,
    variant = "fadeUp",
    className = "",
    duration = 0.3,
    delay = 0,
}) => {
    const selectedVariant = variants[variant] || variants.fadeUp;

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={selectedVariant}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1], // Smooth easing
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

PageTransition.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf([
        "fade",
        "fadeUp",
        "fadeDown",
        "fadeScale",
        "slideRight",
        "slideLeft",
    ]),
    className: PropTypes.string,
    duration: PropTypes.number,
    delay: PropTypes.number,
};

export default PageTransition;
