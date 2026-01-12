/**
 * GuestPrompt Component
 * Non-intrusive prompt for guest users to sign up
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiX,
    FiLogIn,
    FiUserPlus,
    FiPlay,
    FiHeart,
    FiBookmark,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

// ============================================================================
// INLINE PROMPT - For actions that require auth
// ============================================================================

export const AuthRequiredPrompt = ({
    action = "do this",
    onDismiss,
    variant = "default", // default, card, minimal
}) => {
    const navigate = useNavigate();

    if (variant === "minimal") {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-[var(--text-tertiary)] mb-2">
                    Sign in to {action}
                </p>
                <button
                    onClick={() => navigate("/auth")}
                    className="text-sm text-[var(--brand-primary)] hover:underline"
                >
                    Sign in →
                </button>
            </div>
        );
    }

    if (variant === "card") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 text-center"
            >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--brand-primary-light)] flex items-center justify-center">
                    <FiLogIn className="w-8 h-8 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Sign in to {action}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                    Create an account or sign in to access all features
                </p>
                <div className="flex gap-3 justify-center">
                    <Link to="/auth" className="btn btn-primary">
                        Sign In
                    </Link>
                    <Link to="/auth?mode=signup" className="btn btn-secondary">
                        Create Account
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay"
        >
            <div className="bg-[var(--bg-elevated)] rounded-2xl p-8 max-w-md w-full shadow-xl">
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-tertiary)] rounded-lg"
                    >
                        <FiX size={20} />
                    </button>
                )}

                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full animated-gradient flex items-center justify-center">
                        <FiLogIn className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        Sign in required
                    </h2>
                    <p className="text-[var(--text-tertiary)] mb-6">
                        You need to be signed in to {action}. Join our community
                        for free!
                    </p>

                    <div className="space-y-3">
                        <Link to="/auth" className="btn btn-primary w-full">
                            Sign In
                        </Link>
                        <Link
                            to="/auth?mode=signup"
                            className="btn btn-secondary w-full"
                        >
                            Create Free Account
                        </Link>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                            >
                                Maybe later
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================================
// FLOATING SIGNUP BANNER - Shows after scrolling
// ============================================================================

export const GuestSignupBanner = () => {
    const { isAuthenticated } = useAuth();
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated || dismissed) return;

        const handleScroll = () => {
            if (window.scrollY > 500 && !show) {
                setShow(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isAuthenticated, dismissed, show]);

    if (isAuthenticated || !show || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-40 p-4"
            >
                <div className="max-w-4xl mx-auto glass-strong rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-[var(--text-tertiary)]">
                            <FiHeart className="text-pink-500" />
                            <FiBookmark className="text-blue-500" />
                            <FiPlay className="text-purple-500" />
                        </div>
                        <div>
                            <p className="font-medium text-[var(--text-primary)]">
                                Get the full experience
                            </p>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                Sign up to like, save, and personalize your feed
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/auth")}
                            className="btn btn-primary text-sm whitespace-nowrap"
                        >
                            Sign Up Free
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <FiX className="text-[var(--text-tertiary)]" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================================
// FEATURE TEASER - Shows benefits of signing up
// ============================================================================

export const FeatureTeaser = ({ feature, onSignUp }) => {
    const features = {
        like: {
            icon: FiHeart,
            title: "Like videos you enjoy",
            description: "Save your favorites and help creators",
        },
        save: {
            icon: FiBookmark,
            title: "Save to Watch Later",
            description: "Build your personal video library",
        },
        subscribe: {
            icon: FiUserPlus,
            title: "Subscribe to channels",
            description: "Never miss new content from your favorites",
        },
    };

    const {
        icon: Icon,
        title,
        description,
    } = features[feature] || features.like;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-xl p-6 text-white"
        >
            <Icon className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-white/80 mb-4">{description}</p>
            <button
                onClick={onSignUp}
                className="bg-white text-[var(--brand-primary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
                Sign Up Free
            </button>
        </motion.div>
    );
};

// ============================================================================
// USE AUTH GUARD HOOK
// ============================================================================

export const useAuthGuard = () => {
    const { isAuthenticated } = useAuth();
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptAction, setPromptAction] = useState("");

    const requireAuth = (action, callback) => {
        if (isAuthenticated) {
            callback?.();
            return true;
        }
        setPromptAction(action);
        setShowPrompt(true);
        return false;
    };

    const PromptComponent = showPrompt ? (
        <AuthRequiredPrompt
            action={promptAction}
            onDismiss={() => setShowPrompt(false)}
        />
    ) : null;

    return { requireAuth, PromptComponent, isAuthenticated };
};

export default AuthRequiredPrompt;
