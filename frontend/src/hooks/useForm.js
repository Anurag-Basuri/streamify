import { useState } from 'react';

const useForm = (initialState = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (validationRules) => {
        const newErrors = {};
        Object.keys(validationRules).forEach(key => {
            const value = formData[key];
            const rules = validationRules[key];
            
            if (rules.required && !value) {
                newErrors[key] = `${key} is required`;
            } else if (rules.pattern && !rules.pattern.test(value)) {
                newErrors[key] = rules.message || `Invalid ${key}`;
            } else if (rules.custom) {
                const customError = rules.custom(value, formData);
                if (customError) newErrors[key] = customError;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        loading,
        setLoading,
        handleChange,
        validateForm
    };
};

export default useForm;