import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generate_Access_Refresh_token } from "../utils/tokens.js";
import { v2 as cloudinary } from "cloudinary";
import {
    sendVerificationEmail,
    sendPasswordChangedEmail,
    generateToken,
    hashToken,
} from "../utils/email.js";

// Token expiry for email verification
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Function to handle user registration
const registerUser = asynchandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new APIerror(400, "Validation Error", errors.array()));
    }

    const { fullName, email, userName, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
        return next(new APIerror(409, "Username or Email already exists"));
    }

    const avatarFile = req.files?.avatar?.[0];
    let avatarUrl = null,
        avatarPublicId = null;

    if (avatarFile) {
        const avatarLocalPath = avatarFile.path;
        const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
        avatarUrl = avatarUploadResult?.secure_url || null;
        avatarPublicId = avatarUploadResult?.public_id || null;
    }

    // Generate email verification token
    const verificationToken = generateToken();
    const hashedToken = hashToken(verificationToken);

    const newUser = await User.create({
        userName,
        fullName,
        email,
        password,
        avatar: avatarUrl,
        avatarPublicId,
        isEmailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: new Date(
            Date.now() + EMAIL_VERIFICATION_EXPIRY
        ),
    });

    if (!newUser._id) {
        return next(new APIerror(500, "User creation failed"));
    }

    // Send verification email (don't fail registration if email fails)
    try {
        await sendVerificationEmail(newUser, verificationToken);
    } catch (error) {
        console.error("Failed to send verification email:", error);
    }

    const userResponse = {
        _id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        avatar: newUser.avatar,
        isEmailVerified: newUser.isEmailVerified,
    };

    res.status(201).json(
        new APIresponse(
            201,
            userResponse,
            "Registration successful! Please check your email to verify your account."
        )
    );
});

// Function to handle user login
const loginUser = asynchandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(new APIerror(404, "User does not exist"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return next(new APIerror(401, "Incorrect password"));
    }

    const { refreshToken, accessToken } = await generate_Access_Refresh_token(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIresponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

// Function to handle user logout
const logoutUser = asynchandler(async (req, res, next) => {
    // Remove refresh token from database
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
    });

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    res.status(200).json(new APIresponse(200, null, "Logged out successfully"));
});

// Function for refreshing Token to keep the user login
const refreshAccessToken = asynchandler(async (req, res, next) => {
    const incoming = req.cookies.refreshToken || req.body.refreshToken;

    if (!incoming) {
        return next(new APIerror(401, "unauthorized request"));
    }

    try {
        const decodedToken = jwt.verify(
            incoming,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || incoming !== user?.refreshToken) {
            return next(new APIerror(401, "Invalid or expired refresh token"));
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generate_Access_Refresh_token(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new APIresponse(
                    200,
                    { accessToken, refreshToken },
                    "Access Token refreshed"
                )
            );
    } catch (error) {
        return next(
            new APIerror(401, error?.message || "Invalid refresh token")
        );
    }
});

// Change current password
const changePassword = asynchandler(async (req, res, next) => {
    const { oldPassword, newPassword1, newPassword2 } = req.body;

    if (newPassword1 !== newPassword2) {
        return next(new APIerror(400, "New passwords do not match"));
    }

    const user = await User.findById(req.user?._id);
    const isoldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isoldPasswordCorrect) {
        return next(new APIerror(401, "Old password is incorrect"));
    }

    user.password = newPassword1;
    await user.save({ validateBeforeSave: false });

    // Send password changed notification email
    try {
        await sendPasswordChangedEmail(user);
    } catch (error) {
        console.error("Failed to send password changed email:", error);
    }

    return res
        .status(200)
        .json(new APIresponse(200, null, "Password changed successfully"));
});

// Get current user
const getCurrentUser = asynchandler(async (req, res, next) => {
    return res
        .status(200)
        .json(
            new APIresponse(200, req.user, "Current user fetched successfully")
        );
});

// Update account details
const updateAccountDetails = asynchandler(async (req, res, next) => {
    const { userName, email, fullName } = req.body;
    const userID = req.user?._id;

    // Check for existing user with new userName/email
    const existingUser = await User.findOne({
        $or: [{ userName }, { email }],
        _id: { $ne: userID },
    });
    if (existingUser)
        return next(new APIerror(409, "Username or Email already exists"));

    // Process avatar upload
    let avatarUrl, avatarPublicId;
    if (req.files?.avatar) {
        const avatarFile = req.files.avatar[0];
        const uploadResult = await uploadOnCloudinary(avatarFile.path);
        avatarUrl = uploadResult.secure_url;
        avatarPublicId = uploadResult.public_id;
        // Delete old avatar from Cloudinary if exists
        if (req.user.avatarPublicId)
            await cloudinary.uploader.destroy(req.user.avatarPublicId);
    }

    // Process cover image upload
    let coverImageUrl, coverImagePublicId;
    if (req.files?.coverImage) {
        const coverFile = req.files.coverImage[0];
        const uploadResult = await uploadOnCloudinary(coverFile.path);
        coverImageUrl = uploadResult.secure_url;
        coverImagePublicId = uploadResult.public_id;
        // Delete old cover image from Cloudinary if exists
        if (req.user.coverImagePublicId)
            await cloudinary.uploader.destroy(req.user.coverImagePublicId);
    }

    // Prepare update object
    const update = {
        userName,
        email,
        fullName,
        ...(avatarUrl && { avatar: avatarUrl, avatarPublicId }),
        ...(coverImageUrl && { coverImage: coverImageUrl, coverImagePublicId }),
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userID, update, {
        new: true,
        runValidators: true,
    }).select("-password -refreshToken");

    if (!updatedUser) return next(new APIerror(404, "User not found"));

    res.status(200).json(new APIresponse(200, updatedUser, "Account updated"));
});

// Change Avatar image
const changeAvatar = asynchandler(async (req, res, next) => {
    const userID = req.user?._id;

    // Step 1: Check if an avatar file is provided
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        return next(new APIerror(400, "Avatar image is required"));
    }

    try {
        // Step 2: Retrieve the user's current avatar public_id from the database
        const user = await User.findById(userID);
        if (!user) {
            return next(new APIerror(404, "User not found"));
        }

        // Step 3: Upload new avatar file to Cloudinary
        const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarUploadResult || !avatarUploadResult.secure_url) {
            return next(
                new APIerror(500, "Failed to upload avatar to Cloudinary")
            );
        }

        const avatarUrl = avatarUploadResult.secure_url;
        const avatarPublicId = avatarUploadResult.public_id;

        // Step 4: Delete existing avatar from Cloudinary if it exists
        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (error) {
                console.error(
                    "Failed to delete old avatar from Cloudinary:",
                    error
                );
            }
        }

        // Step 5: Update the database
        user.avatar = avatarUrl;
        user.avatarPublicId = avatarPublicId;
        await user.save({ validateBeforeSave: false });

        // Step 6: Return the updated user info
        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    { avatar: user.avatar },
                    "Avatar updated successfully"
                )
            );
    } catch (error) {
        console.error("Error updating avatar:", error);
        return next(new APIerror(500, "Failed to update avatar"));
    }
});

// Change Cover Image
const changeCoverImage = asynchandler(async (req, res, next) => {
    const userID = req.user?._id;

    // Step 1: Check if a cover image file is provided
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        return next(new APIerror(400, "Cover image is required"));
    }

    try {
        // Step 2: Retrieve the user's current cover image public_id from the database
        const user = await User.findById(userID);
        if (!user) {
            return next(new APIerror(404, "User not found"));
        }

        // Step 3: Upload new cover image file to Cloudinary
        const coverImageUploadResult =
            await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImageUploadResult || !coverImageUploadResult.secure_url) {
            return next(
                new APIerror(500, "Failed to upload cover image to Cloudinary")
            );
        }

        const coverImageUrl = coverImageUploadResult.secure_url;
        const coverImagePublicId = coverImageUploadResult.public_id;

        // Step 4: Delete existing cover image from Cloudinary if it exists
        if (user.coverImagePublicId) {
            try {
                await cloudinary.uploader.destroy(user.coverImagePublicId);
            } catch (error) {
                console.error(
                    "Failed to delete old cover image from Cloudinary:",
                    error
                );
            }
        }

        // Step 5: Update the cover image details in the database
        user.coverImage = coverImageUrl;
        user.coverImagePublicId = coverImagePublicId;
        await user.save({ validateBeforeSave: false });

        // Step 6: Return the updated user info
        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    { coverImage: user.coverImage },
                    "Cover image updated successfully"
                )
            );
    } catch (error) {
        console.error("Error updating cover image:", error);
        return next(new APIerror(500, "Failed to update cover image"));
    }
});

/**
 * Get public user profile with dual relationship system:
 * - Followers/Following (social, for tweets)
 * - Subscribers/Subscriptions (video channel)
 * Plus content counts (videos, tweets, playlists)
 */
const getUserProfile = asynchandler(async (req, res, next) => {
    const { username } = req.params;
    const viewerId = req.user?._id;

    if (!username?.trim()) {
        return next(new APIerror(400, "Username is missing"));
    }

    try {
        const profile = await User.aggregate([
            // Match user by username (case-insensitive)
            {
                $match: {
                    userName: { $regex: new RegExp(`^${username}$`, "i") },
                },
            },
            // ====== SOCIAL FOLLOWS ======
            // Followers (people who follow this user)
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "followee",
                    as: "followers",
                },
            },
            // Following (people this user follows)
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "follower",
                    as: "following",
                },
            },
            // ====== VIDEO SUBSCRIPTIONS ======
            // Subscribers (people subscribed to this channel)
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            // Subscriptions (channels this user subscribes to)
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriptions",
                },
            },
            // ====== CONTENT COUNTS ======
            // Videos count (published only for public view)
            {
                $lookup: {
                    from: "videos",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$owner", "$$userId"] },
                                        { $eq: ["$isPublished", true] },
                                    ],
                                },
                            },
                        },
                        { $count: "count" },
                    ],
                    as: "videosData",
                },
            },
            // Tweets count
            {
                $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "owner",
                    as: "tweets",
                },
            },
            // Playlists count (public only)
            {
                $lookup: {
                    from: "playlists",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$owner", "$$userId"] },
                                        { $eq: ["$isPublic", true] },
                                    ],
                                },
                            },
                        },
                        { $count: "count" },
                    ],
                    as: "playlistsData",
                },
            },
            // ====== COMPUTE FIELDS ======
            {
                $addFields: {
                    // Social counts
                    followersCount: { $size: "$followers" },
                    followingCount: { $size: "$following" },
                    // Video channel counts
                    subscribersCount: { $size: "$subscribers" },
                    subscriptionsCount: { $size: "$subscriptions" },
                    // Content counts
                    videosCount: {
                        $ifNull: [
                            { $arrayElemAt: ["$videosData.count", 0] },
                            0,
                        ],
                    },
                    tweetsCount: { $size: "$tweets" },
                    playlistsCount: {
                        $ifNull: [
                            { $arrayElemAt: ["$playlistsData.count", 0] },
                            0,
                        ],
                    },
                    // Viewer relationship status
                    isFollowing: viewerId
                        ? { $in: [viewerId, "$followers.follower"] }
                        : false,
                    isSubscribed: viewerId
                        ? { $in: [viewerId, "$subscribers.subscriber"] }
                        : false,
                    isSelf: viewerId ? { $eq: ["$_id", viewerId] } : false,
                },
            },
            // ====== FINAL PROJECTION (no sensitive data) ======
            {
                $project: {
                    _id: 1,
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                    coverImage: 1,
                    createdAt: 1,
                    // Social
                    followersCount: 1,
                    followingCount: 1,
                    isFollowing: 1,
                    // Video channel
                    subscribersCount: 1,
                    subscriptionsCount: 1,
                    isSubscribed: 1,
                    // Content
                    videosCount: 1,
                    tweetsCount: 1,
                    playlistsCount: 1,
                    // Viewer context
                    isSelf: 1,
                },
            },
        ]);

        if (!profile.length) {
            return next(new APIerror(404, "User not found"));
        }

        return res
            .status(200)
            .json(
                new APIresponse(
                    200,
                    profile[0],
                    "User profile fetched successfully"
                )
            );
    } catch (error) {
        next(error);
    }
});

export {
    changeAvatar,
    changeCoverImage,
    changePassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    getUserProfile,
};
