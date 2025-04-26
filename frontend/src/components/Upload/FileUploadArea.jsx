import PropTypes from 'prop-types';
import { CloudArrowUpIcon as CloudUploadIcon } from "@heroicons/react/24/outline";

export const FileUploadArea = ({ videoFile, thumbnail, onFileUpload }) => (
    <div className="space-y-6">
        {/* Video Upload Section */}
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Upload Video</h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-12 cursor-pointer hover:border-purple-500 transition-colors">
                <CloudUploadIcon className="w-16 h-16 text-gray-400 mb-4" />
                <span className="text-purple-400 font-medium text-lg">
                    {videoFile ? videoFile.name : "Click to upload video"}
                </span>
                <span className="text-gray-400 text-sm mt-2">
                    MP4, WebM up to 2GB
                </span>
                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => onFileUpload("video", e.target.files[0])}
                    className="hidden"
                />
            </label>
        </div>

        {/* Thumbnail Section */}
        {videoFile && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Thumbnail</h3>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 cursor-pointer hover:border-purple-500 transition-colors">
                    {thumbnail ? (
                        <img
                            src={URL.createObjectURL(thumbnail)}
                            alt="Thumbnail preview"
                            className="max-h-48 rounded-lg"
                        />
                    ) : (
                        <>
                            <CloudUploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <span className="text-purple-400 font-medium">
                                Upload Thumbnail
                            </span>
                            <span className="text-gray-400 text-sm mt-2">
                                PNG, JPG up to 2MB
                            </span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            onFileUpload("thumbnail", e.target.files[0])
                        }
                        className="hidden"
                    />
                </label>
            </div>
        )}
    </div>
);

FileUploadArea.propTypes = {
    videoFile: PropTypes.object,
    thumbnail: PropTypes.object,
    onFileUpload: PropTypes.func.isRequired,
};
