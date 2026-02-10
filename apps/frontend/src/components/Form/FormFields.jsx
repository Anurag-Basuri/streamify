import PropTypes from "prop-types";

export const FormFields = ({ formData, onChange, errors }) => (
    <div className="space-y-6">
        {/* Title */}
        <div>
            <label className="block text-white text-sm font-medium mb-2">
                Title *
            </label>
            <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter video title"
                required
                minLength={5}
                maxLength={100}
            />
            {errors.title && (
                <p className="mt-1 text-red-400 text-sm">{errors.title}</p>
            )}
        </div>

        {/* Description */}
        <div>
            <label className="block text-white text-sm font-medium mb-2">
                Description
            </label>
            <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none h-32"
                placeholder="Describe your video"
            />
            {errors.description && (
                <p className="mt-1 text-red-400 text-sm">{errors.description}</p>
            )}
        </div>

        {/* Tags */}
        <div>
            <label className="block text-white text-sm font-medium mb-2">
                Tags
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
                {formData.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            <input
                type="text"
                name="newTag"
                value={formData.newTag}
                onChange={onChange}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Add tags (press Enter to add)"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (formData.newTag.trim()) {
                            onChange({
                                target: {
                                    name: "tags",
                                    value: [...formData.tags, formData.newTag.trim()],
                                },
                            });
                            onChange({
                                target: { name: "newTag", value: "" },
                            });
                        }
                    }
                }}
            />
        </div>
    </div>
);

FormFields.propTypes = {
    formData: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
        newTag: PropTypes.string.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
};