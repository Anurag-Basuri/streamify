import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiCheck } from "react-icons/fi";
import { forgotPassword } from "../../services/authService";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
            toast.success("Reset email sent!");
        } catch {
            // Always show success to prevent email enumeration
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

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
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
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

                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <motion.div
                                variants={itemVariants}
                                className="text-center mb-8"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <FiMail className="text-3xl text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-300 text-sm">
                                    No worries! Enter your email and we&apos;ll
                                    send you reset instructions.
                                </p>
                            </motion.div>

                            {/* Form */}
                            <motion.form
                                variants={itemVariants}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-red-400 text-sm mt-1">
                                            {error}
                                        </p>
                                    )}
                                </div>

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
                                            Sending...
                                        </span>
                                    ) : (
                                        "Send Reset Link"
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
                                Check Your Email
                            </h2>
                            <p className="text-gray-300 mb-6">
                                If an account exists for{" "}
                                <strong className="text-purple-400">
                                    {email}
                                </strong>
                                , you&apos;ll receive password reset
                                instructions shortly.
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                Didn&apos;t receive the email? Check your spam
                                folder or{" "}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-purple-400 hover:text-purple-300 underline"
                                >
                                    try again
                                </button>
                            </p>
                        </motion.div>
                    )}

                    {/* Back to Login */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-6 text-center"
                    >
                        <Link
                            to="/auth?mode=login"
                            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                            <FiArrowLeft />
                            Back to Login
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
