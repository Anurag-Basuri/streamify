import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import PropTypes from "prop-types";

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
        if (user) {
            const timeout = setTimeout(() => {
                navigate(redirect);
            }, 500); // Add slight delay for animation to complete
            return () => clearTimeout(timeout);
        }
    }, [user, navigate, redirect]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmissionError("");
        try {
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
        } catch (error) {
            setSubmissionError(error.message || "An unexpected error occurred");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
            {/* Animated Spotlight Effect */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute inset-0 bg-grid-white/10 bg-grid animate-spotlight" />
            </div>

            {/* Floating Particles */}
            <ParticlesBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md z-10"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="bg-white/10 backdrop-filter backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 animate-shimmer" />

                        {/* Content */}
                        <motion.div variants={itemVariants}>
                            <LogoAnimation mode={mode} />
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
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const ParticlesBackground = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/10 rounded-full"
                    initial={{
                        x: Math.random() * dimensions.width,
                        y: Math.random() * dimensions.height,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.2, 1],
                        x: Math.random() * dimensions.width,
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    );
};

const LogoAnimation = ({ mode }) => (
    <motion.div
        className="text-center mb-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <motion.div
            className="w-20 h-20 mx-auto mb-4 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-20 animate-float" />
            <div className="absolute inset-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20" />
            <motion.div
                className="absolute inset-0 flex items-center justify-center text-white text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                {mode === "signup" ? <FiUser /> : <FiLock />}
            </motion.div>
        </motion.div>
    </motion.div>
);

LogoAnimation.propTypes = {
    mode: PropTypes.oneOf(["login", "signup"]).isRequired,
};

const FormField = ({ label, type, name, value, onChange, onBlur, error }) => {
    const icons = {
        email: <FiMail />,
        password: <FiLock />,
        text: <FiUser />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="group"
        >
            <label className="block text-gray-300 mb-1 text-sm">{label}</label>
            <motion.div
                className="relative"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-white">
                    {icons[type]}
                </span>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="w-full bg-white/10 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-300/20 
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
};

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    error: PropTypes.string,
};

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
            className="relative group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-white">
                <FiLock />
            </span>
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full bg-white/10 text-white pl-10 pr-10 py-2 rounded-lg border border-gray-300/20 
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
        <AnimatePresence mode="wait">
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

PasswordField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    error: PropTypes.string,
    showPassword: PropTypes.bool.isRequired,
    togglePassword: PropTypes.func.isRequired,
};

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
