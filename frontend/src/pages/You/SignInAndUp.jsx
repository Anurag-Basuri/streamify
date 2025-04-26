import { useEffect } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";

const AuthForm = ({
    mode = "login",
    formData,
    isLoading,
    onSubmit,
    onChange,
    errors,
}) => {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(formData);
            }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
        >
            <h2 className="text-2xl font-bold mb-6">
                {mode === "signup" ? "Create Account" : "Sign In"}
            </h2>
            {mode === "signup" && (
                <>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={onChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                            required
                        />
                        {errors?.fullName && (
                            <p className="text-red-500 text-sm">
                                {errors.fullName}
                            </p>
                        )}

                        <input
                            type="text"
                            name="userName"
                            placeholder="Username"
                            value={formData.userName}
                            onChange={onChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                            required
                        />
                        {errors?.userName && (
                            <p className="text-red-500 text-sm">
                                {errors.userName}
                            </p>
                        )}
                    </div>
                </>
            )}

            <div className="space-y-4 mt-4">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                />
                {errors?.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                )}

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={onChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                />
                {errors?.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
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
            </button>
        </form>
    );
};

const SignInAndUp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, googleLogin, user, isLoading } = useAuth();

    // Default to 'login' if no mode specified
    const mode = searchParams.get("mode") || "login";
    const redirect = searchParams.get("redirect") || "/profile";

    const { formData, handleChange, errors, validateForm } = useForm({
        fullName: "",
        userName: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (user) navigate(redirect);
    }, [user, navigate, redirect]);

    const handleSubmit = async (data) => {
        if (!validateForm()) return;

        const success = await (mode === "signup"
            ? register(data)
            : login(data));
        if (success) {
            navigate(redirect);
        }
    };

    // Redirect if invalid mode
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
            <div className="w-full max-w-md">
                <AuthForm
                    mode={mode}
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onChange={handleChange}
                />

                <div className="mt-4 text-center">
                    <button
                        onClick={googleLogin}
                        className="w-full bg-white text-gray-700 px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                        <img
                            src="/google-icon.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Continue with Google
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

AuthForm.propTypes = {
    mode: PropTypes.oneOf(["login", "signup"]),
    formData: PropTypes.object.isRequired,
    errors: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SignInAndUp;
