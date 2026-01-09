import Router from "express";
import { body } from "express-validator";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    change_current_password,
    change_Avatar,
    change_CoverImage,
    get_current_user,
    update_account_details,
    get_user_profile,
} from "../controllers/user.controller.js";
import { verifyAccessToken, requireAuth } from "../middlewares/auth.middleware.js";
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

// Validation Rules
const registerValidationRules = [
    body("userName")
        .notEmpty().withMessage("Username is required")
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters"),
    body("fullName")
        .notEmpty().withMessage("Full Name is required")
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage("Full Name must be 3-30 characters"),
    body("email")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidationRules = [
    body("email")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required"),
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
router.post(
    "/login",
    loginValidationRules,
    validateResult,
    loginUser
);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// ===========================================
// PROTECTED ROUTES (Authentication required)
// ===========================================

// Logout user
router.post("/logout", requireAuth, logoutUser);

// Get current user profile
router.get("/current-user", requireAuth, get_current_user);

// Change password
router.patch(
    "/change-password",
    requireAuth,
    [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword1").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
        body("newPassword2").notEmpty().withMessage("Confirm password is required"),
    ],
    validateResult,
    change_current_password
);

// Change avatar
router.patch(
    "/change-avatar",
    requireAuth,
    uploadAvatar,
    change_Avatar
);

// Change cover image
router.patch(
    "/change-cover-image",
    requireAuth,
    uploadCoverImage,
    change_CoverImage
);

// Update account details
router.patch(
    "/update-details",
    requireAuth,
    uploadFields,
    update_account_details
);

// Get user channel profile (public with optional auth for subscription status)
router.get("/c/:username", verifyAccessToken, get_user_profile);

export default router;
