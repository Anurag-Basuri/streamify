import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Header } from "../../components/Form/Header.jsx";
import { ActionButtons } from "../../components/Form/ActionButtons.jsx";
import { FileUploadArea } from "../../components/Upload/FileUploadArea.jsx";
import { FormFields } from "../../components/Form/FormFields.jsx";
import { ErrorDisplay } from "../../components/Form/ErrorDisplay.jsx";
import useForm from "../../hooks/useForm.js";
import useUpload from "../../hooks/useUpload.js";

const Create = () => {
    const navigate = useNavigate();

    // Initialize form with validation rules
    const { formData, handleChange, errors, validateForm } = useForm(
        {
            title: "",
            description: "",
            tags: [],
            newTag: "",
        },
        {
            title: {
                required: true,
                minLength: 5,
                maxLength: 100,
            },
            description: {
                maxLength: 500,
            },
        }
    );

    // Initialize upload handler
    const {
        videoFile,
        thumbnail,
        uploadProgress,
        loading,
        handleFileUpload,
        handleSubmit: handleUploadSubmit,
    } = useUpload(formData, navigate);

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await handleUploadSubmit(e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
            >
                <Header title="Upload Video" />

                {errors.general && <ErrorDisplay error={errors.general} />}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <FileUploadArea
                        videoFile={videoFile}
                        thumbnail={thumbnail}
                        onFileUpload={handleFileUpload}
                        accept={{
                            video: "video/*",
                            image: "image/*",
                        }}
                        maxSize={{
                            video: 2048 * 1024 * 1024, // 2GB
                            image: 5 * 1024 * 1024, // 5MB
                        }}
                    />

                    <FormFields
                        formData={formData}
                        onChange={handleChange}
                        errors={errors}
                        maxLengths={{
                            title: 100,
                            description: 500,
                        }}
                    />

                    <ActionButtons
                        loading={loading}
                        uploadProgress={uploadProgress}
                        onCancel={() => navigate(-1)}
                        submitLabel="Upload Video"
                    />
                </form>
            </motion.div>
        </div>
    );
};

Create.propTypes = {
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
};

export default Create;
