/**
 * SignInAndUp Page
 * Modern, industry-level authentication with glassmorphism and animations
 */
import { useEffect, useState, useMemo } from "react";
import {
    useSearchParams,
    useNavigate,
    Link,
    useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import {
    FiEye,
    FiEyeOff,
    FiUser,
    FiMail,
    FiLock,
    FiArrowRight,
    FiCheck,
    FiAlertCircle,
    FiLoader,
} from "react-icons/fi";
import PropTypes from "prop-types";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
    exit: { opacity: 0, y: -20 },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

// ============================================================================
// GOOGLE ICON COMPONENT
// ============================================================================

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

// ============================================================================
// SOCIAL AUTH BUTTON
// ============================================================================

const SocialAuthButton = ({ provider, onClick, isLoading, disabled }) => {
    const providers = {
        google: {
            icon: <GoogleIcon />,
            label: "Continue with Google",
            bgClass: "bg-white hover:bg-gray-50",
            textClass: "text-gray-700",
            borderClass: "border border-gray-300",
        },
        github: {
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            ),
            label: "Continue with GitHub",
            bgClass: "bg-[#24292e] hover:bg-[#2c3136]",
            textClass: "text-white",
            borderClass: "border border-transparent",
        },
    };

    const config = providers[provider];

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
                w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl
                font-medium transition-all duration-200
                ${config.bgClass} ${config.textClass} ${config.borderClass}
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md
            `}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            whileTap={{ scale: disabled ? 1 : 0.99 }}
        >
            {isLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
                config.icon
            )}
            <span>{isLoading ? "Connecting..." : config.label}</span>
        </motion.button>
    );
};

SocialAuthButton.propTypes = {
    provider: PropTypes.oneOf(["google", "github"]).isRequired,
    onClick: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
};

// ============================================================================
// INPUT FIELD COMPONENT
// ============================================================================

const InputField = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    onBlur,
    error,
    icon: Icon,
    placeholder,
    autoComplete,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div variants={itemVariants} className="space-y-1.5">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
            </label>
            <div className="relative">
                <div
                    className={`
                    absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200
                    ${
                        isFocused
                            ? "text-[var(--brand-primary)]"
                            : "text-[var(--text-tertiary)]"
                    }
                    ${error ? "text-[var(--error)]" : ""}
                `}
                >
                    <Icon size={18} />
                </div>
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    onFocus={() => setIsFocused(true)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className={`
                        w-full pl-11 pr-4 py-3.5 rounded-xl
                        bg-[var(--input-bg)] border-2 transition-all duration-200
                        text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                        focus:outline-none
                        ${
                            error
                                ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20"
                                : "border-[var(--input-border)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                        }
                    `}
                />
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-1.5 text-sm text-[var(--error)]"
                    >
                        <FiAlertCircle size={14} />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    icon: PropTypes.elementType.isRequired,
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
};

// ============================================================================
// PASSWORD FIELD COMPONENT
// ============================================================================

const PasswordField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    showStrength = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const getStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return score;
    };

    const strength = showStrength ? getStrength(value) : 0;
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-500",
    ];

    return (
        <motion.div variants={itemVariants} className="space-y-1.5">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
            </label>
            <div className="relative">
                <div
                    className={`
                    absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200
                    ${
                        isFocused
                            ? "text-[var(--brand-primary)]"
                            : "text-[var(--text-tertiary)]"
                    }
                    ${error ? "text-[var(--error)]" : ""}
                `}
                >
                    <FiLock size={18} />
                </div>
                <input
                    id={name}
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    onFocus={() => setIsFocused(true)}
                    autoComplete={
                        name === "password"
                            ? "current-password"
                            : "new-password"
                    }
                    placeholder="••••••••"
                    className={`
                        w-full pl-11 pr-12 py-3.5 rounded-xl
                        bg-[var(--input-bg)] border-2 transition-all duration-200
                        text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                        focus:outline-none
                        ${
                            error
                                ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20"
                                : "border-[var(--input-border)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                        }
                    `}
                />
                <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {showPassword ? (
                        <FiEyeOff size={18} />
                    ) : (
                        <FiEye size={18} />
                    )}
                </motion.button>
            </div>

            {/* Password strength indicator */}
            {showStrength && value && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-1"
                >
                    <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                    i < strength
                                        ? strengthColors[strength - 1]
                                        : "bg-[var(--bg-tertiary)]"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">
                        Password strength:{" "}
                        <span
                            className={
                                strength > 2
                                    ? "text-green-500"
                                    : "text-[var(--text-secondary)]"
                            }
                        >
                            {strengthLabels[strength - 1] || "Too weak"}
                        </span>
                    </p>
                </motion.div>
            )}

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-1.5 text-sm text-[var(--error)]"
                    >
                        <FiAlertCircle size={14} />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

PasswordField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    showStrength: PropTypes.bool,
};

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

const Divider = ({ text }) => (
    <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--divider)]" />
        </div>
        <div className="relative flex justify-center">
            <span className="px-4 text-sm text-[var(--text-tertiary)] bg-[var(--bg-elevated)]">
                {text}
            </span>
        </div>
    </div>
);

Divider.propTypes = {
    text: PropTypes.string.isRequired,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SignInAndUp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, googleLogin, user, isLoading } = useAuth();

    const [submissionError, setSubmissionError] = useState("");
    const [successMessage, setSuccessMessage] = useState(
        location.state?.message || ""
    );
    const [googleLoading, setGoogleLoading] = useState(false);
    const [[direction], setDirection] = useState([0]);

    const mode = searchParams.get("mode") || "login";
    const redirect = searchParams.get("redirect") || "/";

    // Change direction when mode changes
    useEffect(() => {
        setDirection([mode === "signup" ? 1 : -1]);
    }, [mode]);

    const validationRules = useMemo(
        () => ({
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
        }),
        [mode]
    );

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
            const timeout = setTimeout(() => navigate(redirect), 500);
            return () => clearTimeout(timeout);
        }
    }, [user, navigate, redirect]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmissionError("");
        setSuccessMessage("");

        try {
            if (mode === "signup") {
                const result = await register(formData);
                if (result?.success) {
                    navigate("/auth?mode=login", {
                        state: { message: result.message },
                    });
                }
            } else {
                await login(formData);
            }
        } catch (error) {
            setSubmissionError(error.message || "An unexpected error occurred");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await googleLogin();
        } catch (error) {
            setSubmissionError(error.message || "Google login failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg-primary)]">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-primary)]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--brand-secondary)]/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={mode}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="bg-[var(--bg-elevated)] rounded-2xl shadow-xl border border-[var(--border-light)] p-8"
                    >
                        {/* Header */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="text-center mb-8"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] mb-4"
                            >
                                {mode === "signup" ? (
                                    <FiUser className="w-8 h-8 text-white" />
                                ) : (
                                    <FiLock className="w-8 h-8 text-white" />
                                )}
                            </motion.div>
                            <motion.h1
                                variants={itemVariants}
                                className="text-2xl font-bold text-[var(--text-primary)]"
                            >
                                {mode === "signup"
                                    ? "Create Account"
                                    : "Welcome Back"}
                            </motion.h1>
                            <motion.p
                                variants={itemVariants}
                                className="text-[var(--text-secondary)] mt-2"
                            >
                                {mode === "signup"
                                    ? "Start your streaming journey today"
                                    : "Sign in to continue to Streamify"}
                            </motion.p>
                        </motion.div>

                        {/* Social Auth */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-3 mb-6"
                        >
                            <motion.div variants={itemVariants}>
                                <SocialAuthButton
                                    provider="google"
                                    onClick={handleGoogleLogin}
                                    isLoading={googleLoading}
                                    disabled={isLoading}
                                />
                            </motion.div>
                        </motion.div>

                        <Divider text="or continue with email" />

                        {/* Form */}
                        <motion.form
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {mode === "signup" && (
                                <>
                                    <InputField
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.fullName}
                                        icon={FiUser}
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                    <InputField
                                        label="Username"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.userName}
                                        icon={FiUser}
                                        placeholder="johndoe"
                                        autoComplete="username"
                                    />
                                </>
                            )}

                            <InputField
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.email}
                                icon={FiMail}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                            <PasswordField
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.password}
                                showStrength={mode === "signup"}
                            />

                            {mode === "signup" && (
                                <PasswordField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.confirmPassword}
                                />
                            )}

                            {/* Forgot Password Link */}
                            {mode === "login" && (
                                <motion.div
                                    variants={itemVariants}
                                    className="text-right"
                                >
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-[var(--brand-primary)] hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </motion.div>
                            )}

                            {/* Messages */}
                            <AnimatePresence>
                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="flex items-center gap-2 p-4 rounded-xl bg-[var(--success-light)] text-[var(--success)]"
                                    >
                                        <FiCheck size={18} />
                                        <p className="text-sm">
                                            {successMessage}
                                        </p>
                                    </motion.div>
                                )}
                                {submissionError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="flex items-center gap-2 p-4 rounded-xl bg-[var(--error-light)] text-[var(--error)]"
                                    >
                                        <FiAlertCircle size={18} />
                                        <p className="text-sm">
                                            {submissionError}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={isLoading || googleLoading}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl
                                    bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]
                                    text-white font-semibold text-lg
                                    hover:shadow-lg hover:shadow-[var(--brand-primary)]/25
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all duration-200"
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                            >
                                {isLoading ? (
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>
                                            {mode === "signup"
                                                ? "Create Account"
                                                : "Sign In"}
                                        </span>
                                        <FiArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>

                        {/* Footer */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-8 text-center"
                        >
                            <p className="text-[var(--text-secondary)]">
                                {mode === "login" ? (
                                    <>
                                        Don't have an account?{" "}
                                        <Link
                                            to="/auth?mode=signup"
                                            className="text-[var(--brand-primary)] font-medium hover:underline"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{" "}
                                        <Link
                                            to="/auth?mode=login"
                                            className="text-[var(--brand-primary)] font-medium hover:underline"
                                        >
                                            Sign in
                                        </Link>
                                    </>
                                )}
                            </p>
                        </motion.div>

                        {/* Terms */}
                        {mode === "signup" && (
                            <motion.p
                                variants={itemVariants}
                                className="mt-4 text-xs text-center text-[var(--text-tertiary)]"
                            >
                                By creating an account, you agree to our{" "}
                                <Link
                                    to="/terms"
                                    className="underline hover:text-[var(--text-secondary)]"
                                >
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link
                                    to="/privacy"
                                    className="underline hover:text-[var(--text-secondary)]"
                                >
                                    Privacy Policy
                                </Link>
                            </motion.p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SignInAndUp;
