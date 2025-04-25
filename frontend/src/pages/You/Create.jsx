import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "../../components/Form/Header";
import { ActionButtons } from "../../components/Form/ActionButtons";
import { FileUploadArea } from "../../components/Upload/FileUploadArea";
import { FormFields } from "../../components/Form/FormFields";
import useForm from "../../hooks/useForm";
import useUpload from "../../hooks/useUpload";

const Create = () => {
    const navigate = useNavigate();
    const { formData, handleChange, errors, validateForm } = useForm({
        title: "",
        description: "",
        tags: [],
        newTag: "",
    });

    const {
        videoFile,
        thumbnail,
        uploadProgress,
        loading,
        handleFileUpload,
        handleSubmit,
    } = useUpload(formData, navigate);

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <Header />
                <ErrorDisplay error={errors.general} />

                <form onSubmit={handleSubmit} className="space-y-8">
                    <UploadSection
                        videoFile={videoFile}
                        thumbnail={thumbnail}
                        onFileUpload={handleFileUpload}
                    />

                    <FormFields
                        formData={formData}
                        onChange={handleChange}
                        errors={errors}
                    />

                    <ActionButtons
                        loading={loading}
                        uploadProgress={uploadProgress}
                        onCancel={() => navigate(-1)}
                    />
                </form>
            </motion.div>
        </div>
    );
};

export default Create;
