/**
 * Spinner Component
 * Themed loading spinner with size variants
 */
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Spinner = ({ size = "md", label, className = "" }) => {
    const sizes = {
        xs: { spinner: "w-4 h-4", border: "border-2" },
        sm: { spinner: "w-6 h-6", border: "border-2" },
        md: { spinner: "w-8 h-8", border: "border-3" },
        lg: { spinner: "w-12 h-12", border: "border-4" },
        xl: { spinner: "w-16 h-16", border: "border-4" },
    };

    const { spinner, border } = sizes[size] || sizes.md;

    return (
        <div
            role="status"
            aria-label={label || "Loading"}
            className={`flex flex-col items-center justify-center gap-3 ${className}`}
        >
            <motion.div
                className={`${spinner} ${border} rounded-full border-[var(--brand-primary)] border-t-transparent`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            {label && (
                <span className="text-sm text-[var(--text-tertiary)]">
                    {label}
                </span>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

Spinner.propTypes = {
    size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
    label: PropTypes.string,
    className: PropTypes.string,
};

export default Spinner;
