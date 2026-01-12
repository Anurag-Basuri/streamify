/**
 * Modal Component
 * Accessible modal with focus trap, keyboard navigation, and CSS variables
 */
import { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

// ============================================================================
// FOCUS TRAP HOOK
// ============================================================================

const useFocusTrap = (isOpen, modalRef) => {
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const modal = modalRef.current;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Store previously focused element
        const previouslyFocused = document.activeElement;

        // Focus first element
        firstElement?.focus();

        const handleKeyDown = (e) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        modal.addEventListener("keydown", handleKeyDown);

        return () => {
            modal.removeEventListener("keydown", handleKeyDown);
            // Restore focus
            previouslyFocused?.focus();
        };
    }, [isOpen, modalRef]);
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

const Modal = ({
    isOpen,
    onClose,
    children,
    title,
    size = "md",
    closeOnOverlay = true,
    closeOnEscape = true,
}) => {
    const modalRef = useRef(null);

    // Focus trap
    useFocusTrap(isOpen, modalRef);

    // Escape key handler
    const handleEscape = useCallback(
        (e) => {
            if (e.key === "Escape" && closeOnEscape) {
                onClose();
            }
        },
        [onClose, closeOnEscape]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Prevent body scroll
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleEscape]);

    // Size variants
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full mx-4",
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)] backdrop-blur-sm"
                    onClick={closeOnOverlay ? onClose : undefined}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? "modal-title" : undefined}
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full ${sizes[size]} bg-[var(--bg-elevated)] rounded-xl shadow-xl overflow-hidden border border-[var(--border-light)]`}
                    >
                        {title && (
                            <div className="px-6 py-4 border-b border-[var(--divider)] flex items-center justify-between">
                                <h3
                                    id="modal-title"
                                    className="text-lg font-semibold text-[var(--text-primary)]"
                                >
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                    aria-label="Close modal"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        <div className="p-6">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// CONFIRM MODAL COMPONENT
// ============================================================================

const ConfirmModal = ({
    title,
    message,
    onCancel,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    isOpen,
    isLoading = false,
}) => (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
        <div className="space-y-6">
            <p className="text-[var(--text-secondary)]">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2.5 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2 ${
                        danger
                            ? "bg-[var(--error)] hover:bg-red-600"
                            : "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
                    }`}
                >
                    {isLoading && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {confirmText}
                </button>
            </div>
        </div>
    </Modal>
);

// ============================================================================
// PROP TYPES
// ============================================================================

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
    closeOnOverlay: PropTypes.bool,
    closeOnEscape: PropTypes.bool,
};

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    danger: PropTypes.bool,
    isOpen: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
};

export { Modal as default, ConfirmModal };
