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

const SignInAndUp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, googleLogin, user, isLoading } = useAuth();
    const [submissionError, setSubmissionError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        confirmPassword: {
            required: mode === "signup",
            validate: (value, formData) => value === formData.password,
            message: "Passwords do not match",
        },
    };

    const { formData, handleChange, errors, validateForm, handleBlur } =
        useForm(
            {
                fullName: "",
                userName: "",
                email: "",
                password: "",
                confirmPassword: "",
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ paddingTop: "4rem" }} // Adjust based on header height
        >
            {/* Floating Particles */}
            <div className="absolute w-4 h-4 bg-purple-500/20 rounded-full blur-[2px] top-1/4 left-1/4 animate-float" />
            <div className="absolute w-4 h-4 bg-blue-500/20 rounded-full blur-[2px] top-3/4 left-3/4 animate-float-delay" />

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-br from-white/5 to-purple-500/10 rounded-2xl p-8 w-full max-w-md backdrop-blur-xl border border-white/10 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        {mode === "signup" ? "Create Account" : "Welcome Back"}
                    </h2>
                    <Link
                        to={`/auth?mode=${
                            mode === "login" ? "signup" : "login"
                        }`}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                        Switch to {mode === "login" ? "Sign Up" : "Login"}
                    </Link>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(formData);
                    }}
                    className="space-y-6"
                >
                    {mode === "signup" && (
                        <>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-3 bg-white/5 rounded-lg border-2 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                                <AnimatedErrorMessage
                                    error={errors?.fullName}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-3 bg-white/5 rounded-lg border-2 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                                    placeholder="johndoe123"
                                />
                                <AnimatedErrorMessage
                                    error={errors?.userName}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full px-4 py-3 bg-white/5 rounded-lg border-2 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                            placeholder="john@example.com"
                        />
                        <AnimatedErrorMessage error={errors?.email} />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full px-4 py-3 bg-white/5 rounded-lg border-2 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? "👁️" : "👁️🗨️"}
                            </button>
                        </div>
                        {mode === "signup" && (
                            <PasswordStrength password={formData.password} />
                        )}
                        <AnimatedErrorMessage error={errors?.password} />
                    </div>

                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-3 bg-white/5 rounded-lg border-2 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? "👁️" : "👁️🗨️"}
                                </button>
                            </div>
                            <AnimatedErrorMessage
                                error={errors?.confirmPassword}
                            />
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
                </form>

                <div className="mt-8 space-y-6">
                    {submissionError && (
                        <motion.div
                            className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl"
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

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-transparent text-sm text-white/50">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <motion.button
                        onClick={googleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            className="w-6 h-6"
                        >
                            <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                        </svg>
                        Continue with Google
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SignInAndUp;