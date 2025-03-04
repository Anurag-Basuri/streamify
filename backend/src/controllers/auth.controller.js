import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// ✅ Generate JWT Tokens
export const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// ✅ Register User
export const registerUser = async (req, res) => {
    try {
        const { userName, fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already in use" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            userName,
            fullName,
            email,
            password: hashedPassword,
            avatar: req.files?.avatar?.[0]?.path || "",
            coverImage: req.files?.coverImage?.[0]?.path || "",
        });

        await newUser.save();
        return res
            .status(201)
            .json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Store refreshToken in HttpOnly Cookie (More Secure)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set true in production
            sameSite: "strict",
        });

        return res.json({ accessToken, user });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Google OAuth Controller
export const googleAuth = async (req, res) => {
    try {
        let user = await User.findOne({ googleId: req.user.id });

        if (!user) {
            user = new User({
                googleId: req.user.id,
                userName: req.user.displayName,
                email: req.user.emails[0].value,
                avatar: req.user.photos[0].value,
            });
            await user.save();
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // Store refreshToken in HttpOnly Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.redirect(
            `${process.env.FRONTEND_URL}/oauth?access=${accessToken}`
        );
    } catch (error) {
        console.error("Google OAuth Error:", error);
        return res
            .status(500)
            .json({ message: "Google Authentication Failed" });
    }
};

// ✅ Logout User
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Refresh Access Token
export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // Get from cookie
        if (!refreshToken)
            return res.status(401).json({ message: "Unauthorized" });

        // Verify Refresh Token
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decoded.id);

        if (!user)
            return res.status(403).json({ message: "Invalid refresh token" });

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } =
            generateTokens(user);

        // Store new refresh token in HttpOnly Cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.json({ accessToken });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
    }
};
