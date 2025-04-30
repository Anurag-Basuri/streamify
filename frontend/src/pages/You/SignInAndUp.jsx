import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";

const PasswordStrength = ({ password }) => {
    const { strength, label } = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const labels = ["Very Weak", "Weak", "Good", "Strong", "Very Strong"];
        return {
            strength: score,
            label: labels[Math.min(score - 1, 4)] || "Very Weak",
        };
    }, [password]);

    const getColor = (index) => {
        if (strength <= 1) return "bg-red-500";
        if (strength <= 3)
            return index < strength ? "bg-yellow-500" : "bg-gray-200";
        return index < strength ? "bg-green-500" : "bg-gray-200";
    };

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`h-2 w-full rounded-full ${getColor(i)}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                    />
                ))}
            </div>
            <span
                className={`text-sm font-medium ${
                    strength <= 1
                        ? "text-red-500"
                        : strength <= 3
                        ? "text-yellow-500"
                        : "text-green-500"
                }`}
            >
                {label}
            </span>
        </div>
    );
};

PasswordStrength.propTypes = {
    password: PropTypes.string.isRequired,
};

const AnimatedErrorMessage = ({ error }) => (
    <AnimatePresence>
        {error && (
            <motion.div
                className="flex items-center gap-1 mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <svg
                    className="w-4 h-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                <span className="text-red-500 text-sm">{error}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

const AuthForm = ({
    mode,
    formData,
    isLoading,
    onSubmit,
    onChange,
    onBlur,
    errors,
}) => {
    return (
        <motion.form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(formData);
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 w-full max-w-md shadow-xl border border-purple-100"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === "signup" ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-500">
                    {mode === "signup"
                        ? "Get started with your free account"
                        : "Sign in to continue to your account"}
                </p>
            </div>

            <div className="space-y-5">
                {mode === "signup" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <AnimatedErrorMessage error={errors?.fullName} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    placeholder="johndoe123"
                                />
                            </div>
                            <AnimatedErrorMessage error={errors?.userName} />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            onBlur={onBlur}
                            className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                    <AnimatedErrorMessage error={errors?.email} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            onBlur={onBlur}
                            className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    {mode === "signup" && (
                        <PasswordStrength password={formData.password} />
                    )}
                    <AnimatedErrorMessage error={errors?.password} />
                </div>
            </div>

            <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-white animate-bounce" />
                        <div className="w-4 h-4 rounded-full bg-white animate-bounce delay-100" />
                        <div className="w-4 h-4 rounded-full bg-white animate-bounce delay-200" />
                    </div>
                ) : mode === "signup" ? (
                    "Create Account"
                ) : (
                    "Sign In"
                )}
            </motion.button>
        </motion.form>
    );
};

AuthForm.propTypes = {
    mode: PropTypes.oneOf(["login", "signup"]),
    formData: PropTypes.object.isRequired,
    errors: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
};

AnimatedErrorMessage.propTypes = {
    error: PropTypes.string,
};

const SignInAndUp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, googleLogin, user, isLoading } = useAuth();
    const [submissionError, setSubmissionError] = useState("");

    const mode = searchParams.get("mode") || "login";
    const redirect = searchParams.get("redirect") || "/profile";

    const validationRules = {
        fullName: {
            required: mode === "signup",
            minLength: 2,
            pattern: /^[a-zA-Z\s]*$/,
            message: "Full name can only contain letters and spaces",
        },
        userName: {
            required: mode === "signup",
            minLength: 3,
            pattern: /^[a-zA-Z0-9_]*$/,
            message:
                "Username can only contain letters, numbers and underscores",
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
        },
        password: {
            required: true,
            minLength: 6,
            message: "Password must be at least 6 characters",
        },
    };

    const { formData, handleChange, errors, validateForm, handleBlur } =
        useForm(
            {
                fullName: "",
                userName: "",
                email: "",
                password: "",
            },
            validationRules
        );

    useEffect(() => {
        if (user) navigate(redirect);
    }, [user, navigate, redirect]);

    const handleSubmit = async (data) => {
        if (!validateForm()) return;
        setSubmissionError("");

        try {
            const success = await (mode === "signup"
                ? register(data)
                : login(data));
            if (!success) {
                setSubmissionError(
                    mode === "signup"
                        ? "Registration failed. Please try again."
                        : "Invalid email or password"
                );
            }
        } catch (error) {
            setSubmissionError(
                "An unexpected error occurred. Please try again."
            );
        }
    };

    if (mode !== "login" && mode !== "signup") {
        return <Navigate to="/auth?mode=login" replace />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <div className="w-full max-w-md space-y-6">
                <AuthForm
                    mode={mode}
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />

                {submissionError && (
                    <motion.div
                        className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{submissionError}</span>
                    </motion.div>
                )}

                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <motion.button
                        onClick={googleLogin}
                        className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <img
                            src="/google-icon.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Continue with Google
                    </motion.button>

                    <p className="text-center text-white/90">
                        {mode === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <Link
                                    to="/auth?mode=signup"
                                    className="text-white font-semibold hover:text-purple-200 transition-colors"
                                >
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    to="/auth?mode=login"
                                    className="text-white font-semibold hover:text-purple-200 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default SignInAndUp;
