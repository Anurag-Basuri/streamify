import Router from "express";
import { body } from "express-validator";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    changePassword,
    changeAvatar,
    changeCoverImage,
    getCurrentUser,
    updateAccountDetails,
    getUserProfile,
} from "../controllers/user.controller.js";
import {
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
} from "../controllers/email.controller.js";
import {
    googleAuth,
    getGoogleClientId,
} from "../controllers/google.controller.js";
import {
    verifyAccessToken,
    requireAuth,
} from "../middlewares/auth.middleware.js";
import { validateResult } from "../middlewares/validate.middleware.js";
import {
    uploadAvatar,
    uploadCoverImage,
    uploadFields,
} from "../middlewares/multer.middleware.js";

const router = Router();

// ===========================================
// PUBLIC ROUTES (No authentication required)
// ===========================================

// Google OAuth Routes
router.post("/auth/google", googleAuth);
router.get("/auth/google/client-id", getGoogleClientId);

// Validation Rules
const registerValidationRules = [
    body("userName")
        .notEmpty()
        .withMessage("Username is required")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be 3-30 characters"),
    body("fullName")
        .notEmpty()
        .withMessage("Full Name is required")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Full Name must be 3-30 characters"),
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

const loginValidationRules = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

// Register new user
router.post(
    "/register",
    uploadFields,
    registerValidationRules,
    validateResult,
    registerUser
);

// Login user
router.post("/login", loginValidationRules, validateResult, loginUser);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// ===========================================
// EMAIL ROUTES (Mostly public)
// ===========================================

// Verify email with token
router.get("/verify-email/:token", verifyEmail);

// Request password reset
router.post(
    "/forgot-password",
    [body("email").isEmail().withMessage("Please provide a valid email")],
    validateResult,
    forgotPassword
);

// Reset password with token
router.post(
    "/reset-password/:token",
    [
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required"),
    ],
    validateResult,
    resetPassword
);

// Resend verification email (requires auth)
router.post("/resend-verification", requireAuth, resendVerification);

// ===========================================
// PROTECTED ROUTES (Authentication required)
// ===========================================

// Logout user
router.post("/logout", requireAuth, logoutUser);

// Get current user profile
router.get("/current-user", requireAuth, getCurrentUser);

// Change password
router.patch(
    "/change-password",
    requireAuth,
    [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword1")
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters"),
        body("newPassword2")
            .notEmpty()
            .withMessage("Confirm password is required"),
    ],
    validateResult,
    changePassword
);

// Change avatar
router.patch("/change-avatar", requireAuth, uploadAvatar, changeAvatar);

// Change cover image
router.patch(
    "/change-cover-image",
    requireAuth,
    uploadCoverImage,
    changeCoverImage
);

// Update account details
router.patch(
    "/update-details",
    requireAuth,
    uploadFields,
    updateAccountDetails
);

// Get user channel profile (public with optional auth for subscription status)
router.get("/c/:username", verifyAccessToken, getUserProfile);

export default router;
