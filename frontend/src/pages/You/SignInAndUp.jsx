import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmissionError("");

        const success = await (mode === "signup"
            ? register(formData)
            : login(formData));

        if (!success) {
            setSubmissionError(
                mode === "signup"
                    ? "Registration failed. Please try again."
                    : "Invalid credentials"
            );
        }
    };

    return (
        <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
            {/* Animated background patterns */}
            <div className="absolute inset-0 bg-auth-pattern opacity-10">
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        background: [
                            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)",
                            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)",
                            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)",
                        ],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md z-10"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/10 backdrop-filter backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {mode === "signup"
                                    ? "Create Account"
                                    : "Welcome Back"}
                            </h1>
                            <p className="text-gray-300">
                                {mode === "signup"
                                    ? "Join our community today"
                                    : "Sign in to continue"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === "signup" && (
                                <>
                                    <FormField
                                        label="Full Name"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.fullName}
                                    />
                                    <FormField
                                        label="Username"
                                        name="userName"
                                        type="text"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.userName}
                                    />
                                </>
                            )}

                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.email}
                            />

                            <PasswordField
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.password}
                                showPassword={showPassword}
                                togglePassword={() =>
                                    setShowPassword(!showPassword)
                                }
                            />

                            {mode === "signup" && (
                                <PasswordField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.confirmPassword}
                                    showPassword={showConfirmPassword}
                                    togglePassword={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                />
                            )}

                            {submissionError && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-400 text-sm text-center"
                                >
                                    {submissionError}
                                </motion.p>
                            )}

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-lg font-semibold 
                                     hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02]
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-3"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
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
                                    "Create Account"
                                ) : (
                                    "Sign In"
                                )}
                            </motion.button>

                            <AnimatedDivider />

                            <motion.button
                                type="button"
                                onClick={googleLogin}
                                className="w-full bg-white/10 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2
                                     hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FcGoogle className="w-5 h-5" />
                                Continue with Google
                            </motion.button>

                            <p className="text-center text-gray-300 mt-6">
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
                            </p>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const FormField = ({ label, type, name, value, onChange, onBlur, error }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
    >
        <label className="block text-gray-300 mb-1 text-sm">{label}</label>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-gray-300/20 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300
                         hover:bg-white/[0.15] transform"
            />
        </motion.div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-1"
                >
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </motion.div>
);

const PasswordField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    showPassword,
    togglePassword,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
    >
        <label className="block text-gray-300 mb-1 text-sm">{label}</label>
        <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-gray-300/20 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300
                         hover:bg-white/[0.15]"
            />
            <motion.button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {showPassword ? <FiEyeOff /> : <FiEye />}
            </motion.button>
        </motion.div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-1"
                >
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </motion.div>
);

const AnimatedDivider = () => (
    <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <motion.div
                className="w-full border-t border-gray-300/20"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
            />
        </div>
        <div className="relative flex justify-center text-sm">
            <motion.span
                className="px-2 text-gray-300 bg-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Or continue with
            </motion.span>
        </div>
    </div>
);

export default SignInAndUp;
