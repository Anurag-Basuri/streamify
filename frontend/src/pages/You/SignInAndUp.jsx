import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { signIn, signUp } from "../../services/authService.js"; // Updated imports

function SignInAndUp() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "",
        email: "",
        password: "",
    });

    const toggleAuthMode = () => setIsLogin(!isLogin);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signIn({
                    email: formData.email,
                    password: formData.password,
                }); // Update for signIn
            } else {
                await signUp(formData); // Update for signUp
            }
            // Handle success (e.g., redirect or update UI)
        } catch (error) {
            console.error("Authentication error:", error);
        }
    };

    return (
        <div className="modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="modal-content relative bg-gradient-to-b from-orange-900/20 to-orange-800/30 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <button className="close-modal absolute top-4 right-4 text-orange-100 hover:text-white text-2xl">
                    &times;
                </button>

                <div className="banner bg-orange-600/20 p-6 text-center border-b border-orange-500/30">
                    <h1 className="text-3xl font-bold text-orange-100">
                        StreamIfy
                    </h1>
                    <p className="text-orange-200 mt-2 text-sm">
                        {isLogin
                            ? "Continue watching your favorites"
                            : "Join the streaming revolution"}
                    </p>
                </div>

                <div className="p-8">
                    <button className="w-full flex items-center justify-center gap-3 bg-white text-orange-600 font-semibold py-3 rounded-lg mb-6">
                        <FcGoogle className="text-xl" /> Continue with Google
                    </button>

                    <div className="flex items-center mb-6">
                        <div className="flex-1 border-t border-orange-500/30"></div>
                        <span className="px-4 text-orange-300 text-sm">or</span>
                        <div className="flex-1 border-t border-orange-500/30"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                className="input"
                                onChange={handleChange}
                                required
                            />
                        )}
                        {!isLogin && (
                            <input
                                type="text"
                                name="userName"
                                placeholder="Username"
                                className="input"
                                onChange={handleChange}
                                required
                            />
                        )}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input"
                            onChange={handleChange}
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                className="input"
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-orange-300"
                            >
                                {showPassword ? (
                                    <AiOutlineEyeInvisible />
                                ) : (
                                    <AiOutlineEye />
                                )}
                            </button>
                        </div>
                        <button type="submit" className="btn">
                            {isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-orange-200">
                        {isLogin
                            ? "New to StreamHub?"
                            : "Already have an account?"}
                        <button
                            onClick={toggleAuthMode}
                            className="text-orange-400 font-semibold underline ml-2"
                        >
                            {isLogin ? "Create account" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignInAndUp;
