import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import { AuthForm, SocialLogin } from "../../components/Auth";

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
