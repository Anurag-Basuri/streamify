import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";

const PasswordStrength = ({ password }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    return (
        <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`h-1 w-full rounded ${
                        i < strength ? "bg-purple-600" : "bg-gray-200"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.1 }}
                />
            ))}
        </div>
    );
};

PasswordStrength.propTypes = {
    password: PropTypes.string.isRequired,
};

const AnimatedErrorMessage = ({ error }) => (
    <AnimatePresence>
        {error && (
            <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {error}
            </motion.p>
        )}
    </AnimatePresence>
);

AnimatedErrorMessage.propTypes = {
    error: PropTypes.string,
};

const AuthForm = ({
    mode = "login",
    formData,
    isLoading,
    onSubmit,
    onChange,
    onBlur,
    errors,
}) => {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(formData);
            }}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
        >
            <h2 className="text-2xl font-bold mb-6">
                {mode === "signup" ? "Create Account" : "Sign In"}
            </h2>

            {mode === "signup" && (
                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={onChange}
                            onBlur={onBlur}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <AnimatedErrorMessage error={errors?.fullName} />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="userName"
                            placeholder="Username"
                            value={formData.userName}
                            onChange={onChange}
                            onBlur={onBlur}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <AnimatedErrorMessage error={errors?.userName} />
                    </div>
                </div>
            )}

            <div className="space-y-4 mt-4">
                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={onChange}
                        onBlur={onBlur}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <AnimatedErrorMessage error={errors?.email} />
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={onChange}
                        onBlur={onBlur}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    {mode === "signup" && (
                        <PasswordStrength password={formData.password} />
                    )}
                    <AnimatedErrorMessage error={errors?.password} />
                </div>
            </div>

            <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Processing...
                    </span>
                ) : mode === "signup" ? (
                    "Sign Up"
                ) : (
                    "Sign In"
                )}
            </motion.button>
        </form>
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <div className="w-full max-w-md space-y-4">
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
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {submissionError}
                    </motion.div>
                )}

                <div className="space-y-4">
                    <motion.button
                        onClick={googleLogin}
                        className="w-full bg-white text-gray-700 px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
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

                    <div className="text-center text-white">
                        {mode === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <Link
                                    to="/auth?mode=signup"
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    to="/auth?mode=login"
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SignInAndUp;
