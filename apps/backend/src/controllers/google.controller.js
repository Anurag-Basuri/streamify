// Google OAuth Controller
// Handles Google Sign-In token verification and user creation/login
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { generate_Access_Refresh_token } from "../utils/tokens.js";

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Cookie options for tokens
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Verify Google ID token and authenticate user
 * Creates new account if user doesn't exist
 */
export const googleAuth = asynchandler(async (req, res, next) => {
    const { credential } = req.body;

    if (!credential) {
        return next(new APIerror(400, "Google credential is required"));
    }

    try {
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture, email_verified } = payload;

        if (!email_verified) {
            return next(new APIerror(400, "Google email is not verified"));
        }

        // Check if user exists with this Google ID or email
        let user = await User.findOne({
            $or: [{ googleId }, { email }],
        });

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.isEmailVerified = true; // Google verified the email
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // Create new user with Google data
            const username =
                email.split("@")[0] + "_" + Date.now().toString(36);

            user = await User.create({
                userName: username,
                fullName: name,
                email,
                googleId,
                avatar: picture,
                isEmailVerified: true, // Google accounts are verified
                // Password is not required for Google users
                password: undefined,
            });

            // Remove password requirement validation for Google users
            user.password = null;
            await user.save({ validateBeforeSave: false });
        }

        // Generate tokens
        const { accessToken, refreshToken } =
            await generate_Access_Refresh_token(user._id);

        // Get user without sensitive data
        const userResponse = {
            _id: user._id,
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            coverImage: user.coverImage,
            isEmailVerified: user.isEmailVerified,
        };

        res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            })
            .json(
                new APIresponse(
                    200,
                    {
                        user: userResponse,
                        accessToken,
                        refreshToken,
                    },
                    "Google authentication successful"
                )
            );
    } catch (error) {
        console.error("Google auth error:", error);
        return next(new APIerror(401, "Invalid Google credential"));
    }
});

/**
 * Get Google Client ID for frontend
 * Returns the public client ID for Google Sign-In button
 */
export const getGoogleClientId = asynchandler(async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    { clientId: null, enabled: false },
                    "Google Sign-In not configured"
                )
            );
    }

    res.status(200).json(
        new APIresponse(
            200,
            { clientId, enabled: true },
            "Google Client ID retrieved"
        )
    );
});
