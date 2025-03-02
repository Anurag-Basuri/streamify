import Router from "express";
import passport from "passport";
import { body } from "express-validator";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
} from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ✅ Google OAuth - Redirect User to Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google OAuth - Callback URL
router.get(
    "/google/callback",
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

// ✅ Validation for Registration
const registerValidation = [
    body("userName").notEmpty().withMessage("Username is required").trim(),
    body("fullName").notEmpty().withMessage("Full Name is required").trim(),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

// ✅ Register User
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerValidation,
    registerUser
);

// ✅ Login User
router.post(
    "/login",
    [body("email").isEmail(), body("password").notEmpty()],
    loginUser
);

// ✅ Logout User (Protected)
router.post("/logout", verifyAccessToken, logoutUser);

// ✅ Refresh Token
router.post("/refresh-token", refreshAccessToken);

export default router;
