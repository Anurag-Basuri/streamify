import Router from "express";
import { body } from "express-validator";
import { loginUser, registerUser } from "../controllers/user.controller.js";
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

router.route("/login").post(
    loginUser
);

export default router;
