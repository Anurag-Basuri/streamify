import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Modal = ({ isOpen, onClose, children, title }) => (
    <AnimatePresence mode="wait">
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                >
                    {title && (
                        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    )}
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ConfirmModal = ({
    title,
    message,
    onCancel,
    onConfirm,
    confirmText = "Confirm",
    danger = false,
    isOpen,
}) => (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
        <div className="space-y-6">
            <p className="text-gray-300">{message}</p>
            <div className="flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                        danger
                            ? "bg-red-600 hover:bg-red-500"
                            : "bg-blue-600 hover:bg-blue-500"
                    }`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </Modal>
);

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
};

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    danger: PropTypes.bool,
    isOpen: PropTypes.bool.isRequired,
};

// Export both components
export { Modal as default, ConfirmModal };