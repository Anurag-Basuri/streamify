// Email-related controller functions
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    generateToken,
    hashToken,
} from "../utils/email.js";

// Token expiration times
const TOKEN_EXPIRY = {
    EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
};

/**
 * Send verification email to user
 */
export const sendVerification = asynchandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new APIerror(400, "Email is required"));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists
    if (!user) {
        return res.status(200).json(
            new APIresponse(200, null, "If an account exists, a verification email has been sent")
        );
    }

    if (user.isEmailVerified) {
        return res.status(200).json(
            new APIresponse(200, null, "Email is already verified")
        );
    }

    // Generate verification token
    const token = generateToken();
    const hashedToken = hashToken(token);

    // Save to user
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user, token);
        res.status(200).json(
            new APIresponse(200, null, "Verification email sent successfully")
        );
    } catch (error) {
        // Clear token on email failure
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new APIerror(500, "Failed to send verification email. Please try again."));
    }
});

/**
 * Verify email with token
 */
export const verifyEmail = asynchandler(async (req, res, next) => {
    const { token } = req.params;

    if (!token) {
        return next(new APIerror(400, "Verification token is required"));
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new APIerror(400, "Invalid or expired verification token"));
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    try {
        await sendWelcomeEmail(user);
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Don't fail the verification if welcome email fails
    }

    res.status(200).json(
        new APIresponse(200, { isEmailVerified: true }, "Email verified successfully")
    );
});

/**
 * Request password reset
 */
export const forgotPassword = asynchandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new APIerror(400, "Email is required"));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
        return res.status(200).json(
            new APIresponse(200, null, "If an account exists, a password reset email has been sent")
        );
    }

    // Generate reset token
    const token = generateToken();
    const hashedToken = hashToken(token);

    // Save to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET);
    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail(user, token);
        res.status(200).json(
            new APIresponse(200, null, "Password reset email sent successfully")
        );
    } catch (error) {
        // Clear token on email failure
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new APIerror(500, "Failed to send password reset email. Please try again."));
    }
});

/**
 * Reset password with token
 */
export const resetPassword = asynchandler(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
        return next(new APIerror(400, "Reset token is required"));
    }

    if (!password || !confirmPassword) {
        return next(new APIerror(400, "Password and confirmation are required"));
    }

    if (password !== confirmPassword) {
        return next(new APIerror(400, "Passwords do not match"));
    }

    if (password.length < 6) {
        return next(new APIerror(400, "Password must be at least 6 characters"));
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new APIerror(400, "Invalid or expired reset token"));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send notification email
    try {
        await sendPasswordChangedEmail(user);
    } catch (error) {
        console.error("Failed to send password changed email:", error);
    }

    res.status(200).json(
        new APIresponse(200, null, "Password reset successfully. You can now login with your new password.")
    );
});

/**
 * Resend verification email
 */
export const resendVerification = asynchandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId) {
        return next(new APIerror(401, "Authentication required"));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new APIerror(404, "User not found"));
    }

    if (user.isEmailVerified) {
        return res.status(200).json(
            new APIresponse(200, null, "Email is already verified")
        );
    }

    // Check rate limiting (1 email per 2 minutes)
    if (user.emailVerificationExpires && 
        user.emailVerificationExpires > new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION - 2 * 60 * 1000)) {
        return next(new APIerror(429, "Please wait before requesting another verification email"));
    }

    // Generate new token
    const token = generateToken();
    const hashedToken = hashToken(token);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user, token);
        res.status(200).json(
            new APIresponse(200, null, "Verification email sent successfully")
        );
    } catch (error) {
        return next(new APIerror(500, "Failed to send verification email"));
    }
});

export default {
    sendVerification,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
};
