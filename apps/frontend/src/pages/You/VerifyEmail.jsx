import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiCheck, FiX, FiArrowRight } from "react-icons/fi";
import { verifyEmail } from "../../services/authService";

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("Invalid verification link");
                return;
            }

            try {
                await verifyEmail(token);
                setStatus("success");
            } catch (error) {
                setStatus("error");
                setErrorMessage(
                    error.message ||
                        "Verification failed. The link may have expired."
                );
            }
        };

        verify();
    }, [token]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
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

                    <div className="text-center py-8 relative z-10">
                        {/* Verifying State */}
                        {status === "verifying" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-6"
                                />
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Verifying Your Email
                                </h2>
                                <p className="text-gray-300">
                                    Please wait while we verify your email
                                    address...
                                </p>
                            </motion.div>
                        )}

                        {/* Success State */}
                        {status === "success" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
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
                                    Email Verified! 🎉
                                </h2>
                                <p className="text-gray-300 mb-6">
                                    Your email has been verified successfully.
                                    You can now login to your account.
                                </p>
                                <Link
                                    to="/auth?mode=login"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                                >
                                    Go to Login
                                    <FiArrowRight />
                                </Link>
                            </motion.div>
                        )}

                        {/* Error State */}
                        {status === "error" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                                >
                                    <FiX className="text-4xl text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Verification Failed
                                </h2>
                                <p className="text-gray-300 mb-6">
                                    {errorMessage}
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Link
                                        to="/auth?mode=signup"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                                    >
                                        <FiMail />
                                        Register Again
                                    </Link>
                                    <Link
                                        to="/auth?mode=login"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        Already verified? Login
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
