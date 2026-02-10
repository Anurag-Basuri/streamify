/**
 * Form Components
 * Reusable form inputs with consistent styling and animations
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
    FiEye,
    FiEyeOff,
    FiLock,
    FiAlertCircle,
    FiCheck,
    FiLoader,
    FiArrowRight,
} from "react-icons/fi";
import { fadeUpItem, buttonTap } from "../../utils/animations";

// ============================================================================
// INPUT FIELD
// ============================================================================

export const InputField = ({
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
    required = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div variants={fadeUpItem} className="space-y-1.5">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
                {required && (
                    <span className="text-[var(--error)] ml-1">*</span>
                )}
            </label>
            <div className="relative">
                {Icon && (
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
                )}
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
                    required={required}
                    className={`
                        w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3.5 rounded-xl
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
    icon: PropTypes.elementType,
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
    required: PropTypes.bool,
};

// ============================================================================
// PASSWORD FIELD
// ============================================================================

export const PasswordField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    showStrength = false,
    placeholder = "••••••••",
    autoComplete,
    required = false,
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
        <motion.div variants={fadeUpItem} className="space-y-1.5">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
                {required && (
                    <span className="text-[var(--error)] ml-1">*</span>
                )}
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
                        autoComplete ||
                        (name === "password"
                            ? "current-password"
                            : "new-password")
                    }
                    placeholder={placeholder}
                    required={required}
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
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <FiEyeOff size={18} />
                    ) : (
                        <FiEye size={18} />
                    )}
                </motion.button>
            </div>

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
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
    required: PropTypes.bool,
};

// ============================================================================
// SUBMIT BUTTON
// ============================================================================

export const SubmitButton = ({
    children,
    isLoading = false,
    disabled = false,
    icon: Icon = FiArrowRight,
    variant = "primary",
    fullWidth = true,
    size = "lg",
}) => {
    const variants = {
        primary:
            "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white hover:shadow-lg hover:shadow-[var(--brand-primary)]/25",
        secondary:
            "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)]",
        outline:
            "bg-transparent border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white",
    };

    const sizes = {
        sm: "py-2.5 px-4 text-sm",
        md: "py-3 px-5 text-base",
        lg: "py-4 px-6 text-lg",
    };

    return (
        <motion.button
            type="submit"
            disabled={disabled || isLoading}
            className={`
                ${
                    fullWidth ? "w-full" : ""
                } flex items-center justify-center gap-2 rounded-xl
                font-semibold transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]} ${sizes[size]}
            `}
            variants={buttonTap}
            whileHover={!disabled && !isLoading ? "hover" : undefined}
            whileTap={!disabled && !isLoading ? "tap" : undefined}
        >
            {isLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <span>{children}</span>
                    {Icon && <Icon className="w-5 h-5" />}
                </>
            )}
        </motion.button>
    );
};

SubmitButton.propTypes = {
    children: PropTypes.node.isRequired,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.elementType,
    variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
    fullWidth: PropTypes.bool,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
};

// ============================================================================
// ALERT MESSAGES
// ============================================================================

export const AlertMessage = ({ type, message, onDismiss }) => {
    if (!message) return null;

    const config = {
        success: {
            icon: FiCheck,
            bg: "bg-[var(--success-light)]",
            text: "text-[var(--success)]",
        },
        error: {
            icon: FiAlertCircle,
            bg: "bg-[var(--error-light)]",
            text: "text-[var(--error)]",
        },
        warning: {
            icon: FiAlertCircle,
            bg: "bg-[var(--warning-light)]",
            text: "text-[var(--warning)]",
        },
        info: {
            icon: FiAlertCircle,
            bg: "bg-[var(--info-light)]",
            text: "text-[var(--info)]",
        },
    };

    const { icon: Icon, bg, text } = config[type] || config.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2 p-4 rounded-xl ${bg} ${text}`}
        >
            <Icon size={18} className="flex-shrink-0" />
            <p className="text-sm flex-1">{message}</p>
            {onDismiss && (
                <button onClick={onDismiss} className="p-1 hover:opacity-70">
                    ×
                </button>
            )}
        </motion.div>
    );
};

AlertMessage.propTypes = {
    type: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
    message: PropTypes.string,
    onDismiss: PropTypes.func,
};

// ============================================================================
// DIVIDER
// ============================================================================

export const Divider = ({ text }) => (
    <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--divider)]" />
        </div>
        {text && (
            <div className="relative flex justify-center">
                <span className="px-4 text-sm text-[var(--text-tertiary)] bg-[var(--bg-elevated)]">
                    {text}
                </span>
            </div>
        )}
    </div>
);

Divider.propTypes = {
    text: PropTypes.string,
};

// ============================================================================
// GOOGLE AUTH BUTTON
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

export const GoogleAuthButton = ({
    onClick,
    isLoading,
    disabled,
    mode = "continue",
}) => {
    const labels = {
        continue: "Continue with Google",
        signin: "Sign in with Google",
        signup: "Sign up with Google",
    };

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl
                font-medium bg-white hover:bg-gray-50 text-gray-700
                border border-gray-300 shadow-sm hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            variants={buttonTap}
            whileHover={!disabled && !isLoading ? "hover" : undefined}
            whileTap={!disabled && !isLoading ? "tap" : undefined}
        >
            {isLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
                <GoogleIcon />
            )}
            <span>{isLoading ? "Connecting..." : labels[mode]}</span>
        </motion.button>
    );
};

GoogleAuthButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    mode: PropTypes.oneOf(["continue", "signin", "signup"]),
};

export default {
    InputField,
    PasswordField,
    SubmitButton,
    AlertMessage,
    Divider,
    GoogleAuthButton,
};
