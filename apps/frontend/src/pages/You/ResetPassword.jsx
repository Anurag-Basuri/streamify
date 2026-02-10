import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheck,
    FiX,
    FiArrowRight,
} from "react-icons/fi";
import { resetPassword } from "../../services/authService";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    // Password strength checker
    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-lime-500",
        "bg-green-500",
    ];
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword(
                token,
                formData.password,
                formData.confirmPassword
            );
            setIsSuccess(true);
            toast.success("Password reset successfully!");
        } catch (err) {
            setError(
                err.message ||
                    "Failed to reset password. The link may have expired."
            );
            toast.error(err.message || "Reset failed");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                navigate("/auth?mode=login");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
                        initial={{
                            x:
                                Math.random() *
                                (typeof window !== "undefined"
                                    ? window.innerWidth
                                    : 1000),
                            y:
                                Math.random() *
                                (typeof window !== "undefined"
                                    ? window.innerHeight
                                    : 800),
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden"
                >
                    {/* Shimmer effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 opacity-30 animate-pulse" />

                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <motion.div
                                variants={itemVariants}
                                className="text-center mb-8"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <FiLock className="text-3xl text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Reset Password
                                </h1>
                                <p className="text-gray-300 text-sm">
                                    Enter your new password below
                                </p>
                            </motion.div>

                            {/* Form */}
                            <motion.form
                                variants={itemVariants}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {/* New Password */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff />
                                            ) : (
                                                <FiEye />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength */}
                                    {formData.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                                            i < passwordStrength
                                                                ? strengthColors[
                                                                      passwordStrength -
                                                                          1
                                                                  ]
                                                                : "bg-gray-600"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {strengthLabels[
                                                    passwordStrength - 1
                                                ] || "Too short"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <FiEyeOff />
                                            ) : (
                                                <FiEye />
                                            )}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && (
                                        <div className="flex items-center gap-1 mt-1">
                                            {formData.password ===
                                            formData.confirmPassword ? (
                                                <>
                                                    <FiCheck className="text-green-400 text-sm" />
                                                    <span className="text-green-400 text-xs">
                                                        Passwords match
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiX className="text-red-400 text-sm" />
                                                    <span className="text-red-400 text-xs">
                                                        Passwords don&apos;t
                                                        match
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Resetting...
                                        </span>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </motion.button>
                            </motion.form>
                        </>
                    ) : (
                        /* Success State */
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                            >
                                <FiCheck className="text-4xl text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Password Reset!
                            </h2>
                            <p className="text-gray-300 mb-6">
                                Your password has been reset successfully.
                                Redirecting to login...
                            </p>
                            <Link
                                to="/auth?mode=login"
                                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                            >
                                Go to Login
                                <FiArrowRight />
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
