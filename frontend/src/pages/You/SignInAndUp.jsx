/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { AuthContext } from "../../services/AuthContext.jsx";
import { motion } from "framer-motion";

function SignInAndUp({ onClose, isLoginInitial = true }) {
    const [isLogin, setIsLogin] = useState(isLoginInitial);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const { login, register, isLoading, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect to profile if already logged in
    useEffect(() => {
        if (user) {
            navigate("/profile");
        }
    }, [user, navigate]);

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim() || !formData.email.includes("@")) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!formData.password.trim() || formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
            if (!formData.fullName.trim() || formData.fullName.length < 3) {
                newErrors.fullName = "Full name must be at least 3 characters";
            }
            if (!formData.userName.trim() || formData.userName.length < 3) {
                newErrors.userName = "Username must be at least 3 characters";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Toggle between login and signup forms
    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
        }));
    };

    // Handle input changes
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (isLogin) {
                await login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await register({
                    fullName: formData.fullName,
                    userName: formData.userName,
                    email: formData.email,
                    password: formData.password,
                });
            }
            onClose();
            navigate("/profile");
        } catch (error) {
            setErrors({
                general:
                    error.response?.data?.message || "Authentication failed",
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: 20, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/30 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-gray-100 hover:text-white text-2xl transition-colors"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    &times;
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-purple-400 mb-2">
                            Streamify
                        </h1>
                        <p className="text-gray-300/90 text-sm">
                            {isLogin
                                ? "Continue your streaming journey"
                                : "Start your entertainment experience"}
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* General error message */}
                        {errors.general && (
                            <div className="text-red-300 bg-red-900/20 px-4 py-3 rounded-lg flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>{errors.general}</span>
                            </div>
                        )}

                        {/* Registration fields */}
                        {!isLogin && (
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        className="w-full px-4 py-3 bg-gray-800/20 border border-gray-300/30 rounded-lg placeholder-gray-300/60 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                        onChange={handleChange}
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-300 text-sm mt-1 ml-1">
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="userName"
                                        placeholder="Username"
                                        value={formData.userName}
                                        className="w-full px-4 py-3 bg-gray-800/20 border border-gray-300/30 rounded-lg placeholder-gray-300/60 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                        onChange={handleChange}
                                    />
                                    {errors.userName && (
                                        <p className="text-red-300 text-sm mt-1 ml-1">
                                            {errors.userName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                className="w-full px-4 py-3 bg-gray-800/20 border border-gray-300/30 rounded-lg placeholder-gray-300/60 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <p className="text-red-300 text-sm mt-1 ml-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password fields */}
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    className="w-full px-4 py-3 bg-gray-800/20 border border-gray-300/30 rounded-lg placeholder-gray-300/60 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all pr-12"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300/60 hover:text-purple-400 transition-colors"
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible className="w-6 h-6" />
                                    ) : (
                                        <AiOutlineEye className="w-6 h-6" />
                                    )}
                                </button>
                                {errors.password && (
                                    <p className="text-red-300 text-sm mt-1 ml-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {!isLogin && (
                                <div className="relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        className="w-full px-4 py-3 bg-gray-800/20 border border-gray-300/30 rounded-lg placeholder-gray-300/60 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all pr-12"
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300/60 hover:text-purple-400 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <AiOutlineEyeInvisible className="w-6 h-6" />
                                        ) : (
                                            <AiOutlineEye className="w-6 h-6" />
                                        )}
                                    </button>
                                    {errors.confirmPassword && (
                                        <p className="text-red-300 text-sm mt-1 ml-1">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            )}
                            {isLoading
                                ? "Processing..."
                                : isLogin
                                ? "Sign In"
                                : "Create Account"}
                        </button>
                    </form>

                    {/* Toggle link */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleAuthMode}
                            className="text-gray-200/80 hover:text-purple-300 transition-colors text-sm font-medium"
                        >
                            {isLogin
                                ? "New to Streamify? Create account"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default SignInAndUp;