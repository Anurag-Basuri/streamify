import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";

// Components
const AuthForm = ({ mode, formData, isLoading, onSubmit, onChange }) => {
    return (
        <form onSubmit={onSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
                {mode === "signup" ? "Create Account" : "Sign In"}
            </h2>
            {mode === "signup" && (
                <>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={onChange}
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <input
                        type="text"
                        name="userName"
                        placeholder="Username"
                        value={formData.userName}
                        onChange={onChange}
                        className="w-full p-2 mb-4 border rounded"
                    />
                </>
            )}
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={onChange}
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={onChange}
                className="w-full p-2 mb-4 border rounded"
            />
            {mode === "signup" && (
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={onChange}
                    className="w-full p-2 mb-4 border rounded"
                />
            )}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
                {isLoading ? "Loading..." : mode === "signup" ? "Sign Up" : "Sign In"}
            </button>
        </form>
    );
};

AuthForm.propTypes = {
    mode: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};

const SocialLogin = ({ onGoogleLogin }) => {
    return (
        <div className="mt-4 text-center">
            <button
                onClick={onGoogleLogin}
                className="bg-white text-gray-700 px-6 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100"
            >
                <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                />
                Continue with Google
            </button>
        </div>
    );
};

SocialLogin.propTypes = {
    onGoogleLogin: PropTypes.func.isRequired
};

const SignInAndUp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, googleLogin, user, isLoading } = useAuth();

    const { formData, handleChange, errors } = useForm({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const mode = searchParams.get("mode");
    const redirect = searchParams.get("redirect") || "/profile";

    useEffect(() => {
        if (user) navigate(redirect);
    }, [user, navigate, redirect]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <AuthForm
                mode={mode}
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                onSubmit={mode === "signup" ? register : login}
                onChange={handleChange}
            />
            <SocialLogin onGoogleLogin={googleLogin} />
        </motion.div>
    );
};

export default SignInAndUp;
