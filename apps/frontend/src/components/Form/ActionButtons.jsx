import PropTypes from "prop-types";
import { motion } from "framer-motion";

export const ActionButtons = ({ loading, uploadProgress, onCancel }) => (
    <div className="flex justify-end gap-4">
        <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
        >
            Cancel
        </button>
        <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <motion.div 
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {uploadProgress ? `Uploading ${uploadProgress}%` : "Processing..."}
                </div>
            ) : (
                "Upload Video"
            )}
        </button>
    </div>
);

ActionButtons.propTypes = {
    loading: PropTypes.bool.isRequired,
    uploadProgress: PropTypes.number,
    onCancel: PropTypes.func.isRequired,
};