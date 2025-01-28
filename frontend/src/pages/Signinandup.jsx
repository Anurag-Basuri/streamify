import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

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

  const handleGoogleSignIn = () => {
    // Implement Google OAuth here
    console.log("Redirecting to Google OAuth...");
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="modal-content relative bg-gradient-to-b from-orange-900/20 to-orange-800/30 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <button className="close-modal absolute top-4 right-4 text-orange-100 hover:text-white text-2xl">
          &times;
        </button>

        {/* Animated Header */}
        <div className="banner bg-orange-600/20 p-6 text-center border-b border-orange-500/30">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-orange-100">
            <span className="text-orange-400">Stream</span>
            <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              ▶️
            </span>
            <span className="text-white">Hub</span>
          </h1>
          <p className="text-orange-200 mt-2 text-sm">
            {isLogin
              ? "Continue watching your favorites"
              : "Join the streaming revolution"}
          </p>
        </div>

        <div className="p-8">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white/90 hover:bg-white text-orange-600 font-semibold py-3 rounded-lg transition-all mb-6"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-orange-500/30"></div>
            <span className="px-4 text-orange-300 text-sm">or</span>
            <div className="flex-1 border-t border-orange-500/30"></div>
          </div>

          {/* Dynamic Form */}
          {isLogin ? (
            // Login Form
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Username or Email"
                  className="w-full p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-orange-300 hover:text-orange-400"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>
          ) : (
            // Sign Up Form
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="w-full p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="userName"
                  placeholder="Username"
                  className="w-full p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-orange-300 hover:text-orange-400"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Toggle Auth Mode */}
          <p className="text-center mt-6 text-orange-200">
            {isLogin ? "New to StreamHub?" : "Already have an account?"}{" "}
            <button
              onClick={toggleAuthMode}
              className="text-orange-400 hover:text-orange-300 font-semibold underline transition-colors"
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
