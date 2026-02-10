/**
 * SignInAndUp Page
 * Modern authentication with shared form components
 */
import { useEffect, useState, useMemo } from "react";
import {
    useSearchParams,
    useNavigate,
    Link,
    useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import {
    staggerContainer,
    fadeUpItem,
    slideVariants,
    standardSpring,
} from "../../utils/animations";
import {
    InputField,
    PasswordField,
    SubmitButton,
    AlertMessage,
    Divider,
    GoogleAuthButton,
} from "../../components/Form/FormComponents";

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
                message: "Username: letters, numbers, underscores only",
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
                        transition={standardSpring}
                        className="bg-[var(--bg-elevated)] rounded-2xl shadow-xl border border-[var(--border-light)] p-8"
                    >
                        {/* Header */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="text-center mb-8"
                        >
                            <motion.div
                                variants={fadeUpItem}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] mb-4"
                            >
                                {mode === "signup" ? (
                                    <FiUser className="w-8 h-8 text-white" />
                                ) : (
                                    <FiLock className="w-8 h-8 text-white" />
                                )}
                            </motion.div>
                            <motion.h1
                                variants={fadeUpItem}
                                className="text-2xl font-bold text-[var(--text-primary)]"
                            >
                                {mode === "signup"
                                    ? "Create Account"
                                    : "Welcome Back"}
                            </motion.h1>
                            <motion.p
                                variants={fadeUpItem}
                                className="text-[var(--text-secondary)] mt-2"
                            >
                                {mode === "signup"
                                    ? "Start your streaming journey today"
                                    : "Sign in to continue to Streamify"}
                            </motion.p>
                        </motion.div>

                        {/* Social Auth */}
                        <motion.div variants={fadeUpItem}>
                            <GoogleAuthButton
                                onClick={handleGoogleLogin}
                                isLoading={googleLoading}
                                disabled={isLoading}
                                mode={mode === "signup" ? "signup" : "signin"}
                            />
                        </motion.div>

                        <Divider text="or continue with email" />

                        {/* Form */}
                        <motion.form
                            variants={staggerContainer}
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
                                    variants={fadeUpItem}
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
                                    <AlertMessage
                                        type="success"
                                        message={successMessage}
                                    />
                                )}
                                {submissionError && (
                                    <AlertMessage
                                        type="error"
                                        message={submissionError}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.div variants={fadeUpItem}>
                                <SubmitButton
                                    isLoading={isLoading || googleLoading}
                                >
                                    {mode === "signup"
                                        ? "Create Account"
                                        : "Sign In"}
                                </SubmitButton>
                            </motion.div>
                        </motion.form>

                        {/* Footer */}
                        <motion.div
                            variants={fadeUpItem}
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
                                variants={fadeUpItem}
                                className="mt-4 text-xs text-center text-[var(--text-tertiary)]"
                            >
                                By creating an account, you agree to our{" "}
                                <Link
                                    to="/terms"
                                    className="underline hover:text-[var(--text-secondary)]"
                                >
                                    Terms
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
