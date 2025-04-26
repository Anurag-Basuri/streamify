import { useState } from 'react';

const useForm = (initialState = {}, validationRules = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const validateField = (name, value) => {
        const rules = validationRules[name] || {};
        const newErrors = { ...errors };

        if (rules.required && !value) {
            newErrors[name] = `${name} is required`;
        } else if (rules.minLength && value.length < rules.minLength) {
            newErrors[
                name
            ] = `${name} must be at least ${rules.minLength} characters`;
        } else if (rules.pattern && !rules.pattern.test(value)) {
            newErrors[name] = rules.message || `Invalid ${name}`;
        } else {
            delete newErrors[name];
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    return {
        formData,
        errors,
        touched,
        loading,
        handleChange,
        handleBlur,
        setLoading,
        validateForm: () => Object.keys(errors).length === 0,
    };
};

export default useForm;