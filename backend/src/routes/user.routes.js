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
    get_watch_history,
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

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

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerValidationRules,
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router
    .route("/change-password")
    .patch(verifyAccessToken, change_current_password);
router
    .route("/change-avatar")
    .patch(verifyAccessToken, upload.single("avatar"), change_Avatar);
router
    .route("/change-cover-image")
    .patch(verifyAccessToken, upload.single("coverImage"), change_CoverImage);

router.route("/update-details")
    .patch(
        verifyAccessToken,
        upload.fields([
            { name: "avatar", maxCount: 1 },
            { name: "coverImage", maxCount: 1 }
        ]),
        update_account_details
);

router.route("/current-user").get(verifyAccessToken, get_current_user);
router.route("/c/:username").get(verifyAccessToken, get_user_profile);
router.route("/history").get(verifyAccessToken, get_watch_history);

export default router;
