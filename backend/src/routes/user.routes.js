import Router from "express";
import { body } from "express-validator";
import passport from "passport";
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
    get_watch_history,
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
    uploadAvatar,
    uploadCoverImage,
    uploadFields,
} from "../middlewares/multer.middleware.js";

const router = Router();

// Google OAuth Routes
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        try {
            const user = req.user;
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save();

            res.redirect(
                `${process.env.FRONTEND_URL}/oauth?access=${accessToken}&refresh=${refreshToken}`
            );
        } catch (error) {
            console.error("Google OAuth callback error:", error);
            res.status(500).json({ message: "OAuth authentication failed" });
        }
    }
);

// Validation Rules
const registerValidationRules = [
    body("userName").notEmpty().withMessage("Username is required").trim(),
    body("fullName").notEmpty().withMessage("Full Name is required").trim(),
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

// Auth Routes
router.post(
    "/register",
    uploadFields, // ✅ Using predefined upload middleware for avatar & cover image
    registerValidationRules,
    registerUser
);

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Please provide a valid email")
            .normalizeEmail(),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
    ],
    loginUser
);

router.post("/logout", verifyAccessToken, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// Secure Routes
router.patch("/change-password", verifyAccessToken, change_current_password);
router.patch(
    "/change-avatar",
    verifyAccessToken,
    uploadAvatar, // ✅ Use specific upload middleware
    change_Avatar
);
router.patch(
    "/change-cover-image",
    verifyAccessToken,
    uploadCoverImage, // ✅ Use specific upload middleware
    change_CoverImage
);
router.patch(
    "/update-details",
    verifyAccessToken,
    uploadFields, // ✅ Use predefined upload middleware
    update_account_details
);

router.get("/current-user", verifyAccessToken, get_current_user);
router.get("/c/:username", verifyAccessToken, get_user_profile);
router.get("/history", verifyAccessToken, get_watch_history);

export default router;
