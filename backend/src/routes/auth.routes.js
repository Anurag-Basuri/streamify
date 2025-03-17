import { Router } from "express";
import passport from "passport";
import { body, validationResult } from "express-validator";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    googleAuth,
} from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = Router();

// ✅ Middleware to handle validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ✅ Google OAuth - Redirect User to Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth - Callback URL (Handled in controller)
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    googleAuth
);

// ✅ Validation for Registration
const registerValidation = [
    body("userName").notEmpty().withMessage("Username is required").trim(),
    body("fullName").notEmpty().withMessage("Full Name is required").trim(),
    body("email")
        .isEmail()
        .withMessage("Valid email required")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

// ✅ Register User
router.post(
    "/register",
    uploadAvatar,
    registerValidation,
    validateRequest,
    registerUser
);

// ✅ Login User
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validateRequest,
    loginUser
);

// ✅ Logout User (Protected)
router.post("/logout", verifyAccessToken, logoutUser);

// ✅ Refresh Token
router.post("/refresh-token", refreshAccessToken);

export default router;
