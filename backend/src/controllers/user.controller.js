import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generate_Access_Refresh_token } from "../utils/tokens.js";

// Function to handle user registration
const registerUser = asynchandler(async (req, res, next) => {
    // Step 1: Get user details from the frontend
    const { fullName, email, userName, password } = req.body;

    // Step 2: Handle validation results from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new APIerror(400, "Validation Error", errors.array()));
    }

    // Step 3: Check if the user already exists by username or email
    const existingUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existingUser) {
        return next(new APIerror(409, "Username or Email already exists"));
    }

    // Step 4: Check if avatar is provided
    const avatarFile = req.files?.avatar?.[0]; // Get the file object
    let avatarUrl = null;

    // Step 5: Upload avatar to Cloudinary (if provided)
    if (avatarFile) {
        const avatarLocalPath = avatarFile.path; // Get the path from the file object
        const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath); // Upload to Cloudinary
        avatarUrl = avatarUploadResult.secure_url;
    } else {
        return next(new APIerror(400, "Avatar is required"));
    }

    // Step 6: Handle coverImage (optional)
    const coverImageFile = req.files?.coverImage?.[0];
    let coverImageUrl = null;

    if (coverImageFile) {
        const coverImageLocalPath = coverImageFile.path; // Get the path from the file object
        const coverImageUploadResult =
            await uploadOnCloudinary(coverImageLocalPath); // Upload to Cloudinary
        coverImageUrl = coverImageUploadResult.secure_url;
    }

    // Step 7: Create user object
    const newUser = await User.create({
        userName,
        fullName,
        email,
        password, // Password will be hashed automatically in the model
        avatar: avatarUrl,
        coverImage: coverImageUrl,
    });

    // Step 8: Check if user was created
    if (!newUser._id) {
        return next(new APIerror(500, "User creation failed"));
    }

    // Step 9: Remove sensitive fields (password) from the response
    const userResponse = {
        _id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        avatar: newUser.avatar,
        coverImage: newUser.coverImage,
    };

    // Step 10: Return success response
    res.status(201).json(
        new APIresponse(200, userResponse, "User registered successfully")
    );
});

// Function to handle user login
const loginUser = asynchandler(async (req, res, next) => {
    // Step 1: Get user details from the frontend
    const { userName, email, password } = req.body;

    // Step 2: Handle validation results from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new APIerror(400, "Validation Error", errors.array()));
    }

    // Step 3: Check if the user exists by username or email
    const user = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!user) {
        return next(new APIerror(404, "User does not exist"));
    }

    // Step 4: If the user exists, validate the password
    const pswd = await user.isPasswordCorrect(password);

    if (!pswd) {
        return next(new APIerror(401, "Incorrect password"));
    }

    // Step 5: Generate Refresh and Access Tokens
    const { refreshToken, accessToken } = await generate_Access_Refresh_token(
        user._id
    );

    // Step 6: Remove sensitive fields (password, refreshToken) from the user object
    const loggedInUser = {
        _id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
    };

    // Step 7: Set options for the cookie
    const options = {
        httpOnly: true,
        secure: true, // Set to true in production when using HTTPS
        sameSite: "Strict",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    };

    // Step 8: Send a JSON response with the access token and user info
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options) // Set the refresh token as a cookie
        .json(
            new APIresponse(
                200,
                { accessToken, user: loggedInUser },
                "User successfully logged in"
            )
        );
});

// Function to handle user log out
const logoutUser = asynchandler(async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                refreshToken: undefined,
            },
        });

        // Clear the refresh token cookie
        const options = {
            httpOnly: true,
            secure: true, // Set to true in production when using HTTPS
            sameSite: "Strict",
        };

        res.clearCookie("refreshToken", options);

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return next(new APIerror(500, "Logout failed"));
    }
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
            new APIerror(401, error?.message || "Inavlid refresh token")
        );
    }
});

// Function for changing the current password
const change_current_password = asynchandler(async (req, res, next) => {
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

    return res
        .status(200)
        .json(new APIresponse(200, null, "Password changed successfully"));
});

// Get current User
const get_current_user = asynchandler(async (req, res, next) => {
    return res
        .status(200)
        .json(
            new APIresponse(200, req.user, "Current user fetched successfully")
        );
});

const update_account_details = asynchandler(async (req, res, next) => {
    const { userName, email, fullName } = req.body;
    const userID = req.user?._id;

    // Step 1: Validate input (e.g., userName and email should be unique)
    const existingUser = await User.findOne({
        $or: [{ userName }, { email }],
        _id: { $ne: userID }, // Ensure it doesn't match the current user
    });

    if (existingUser) {
        return next(new APIerror(409, "Username or Email already exists"));
    }

    // Step 2: Prepare update object for selected fields
    const update = {};
    if (userName) update.userName = userName;
    if (email) update.email = email;
    if (fullName) update.fullName = fullName;

    // Step 3: Update the user details in the database
    const updatedUser = await User.findByIdAndUpdate(userID, update, {
        new: true, // Return the updated user document
        runValidators: true, // Apply schema validators on update
    });

    // Handle case where user is not found
    if (!updatedUser) {
        return next(new APIerror(404, "User not found"));
    }

    // Step 4: Prepare user response without sensitive data
    const userResponse = {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatar: updatedUser.avatar,
        coverImage: updatedUser.coverImage,
    };

    // Step 5: Return the user response
    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                userResponse,
                "Account details updated successfully"
            )
        );
});

export {
    change_current_password,
    get_current_user,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    update_account_details,
};
