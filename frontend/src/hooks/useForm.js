import { useState } from 'react';

const useForm = (initialState = {}, validationRules = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when field changes
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic validation for required fields
        Object.keys(formData).forEach((key) => {
            const value = formData[key];
            const rules = validationRules[key] || {};

            if (rules.required && !value) {
                newErrors[key] = `${key} is required`;
            }

            if (rules.minLength && value.length < rules.minLength) {
                newErrors[
                    key
                ] = `${key} must be at least ${rules.minLength} characters`;
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                newErrors[key] = rules.message || `Invalid ${key}`;
            }

            // Email validation
            if (
                key === "email" &&
                value &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ) {
                newErrors[key] = "Please enter a valid email address";
            }

            // Password validation
            if (key === "password" && value && value.length < 6) {
                newErrors[key] = "Password must be at least 6 characters";
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
        validateForm,
    };
};

export default useForm;