import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generate_Access_Refresh_token } from "../utils/tokens.js";
import { v2 as cloudinary } from "cloudinary";

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

    const newUser = await User.create({
        userName,
        fullName,
        email,
        password,
        avatar: avatarUrl,
        avatarPublicId,
    });

    if (!newUser._id) {
        return next(new APIerror(500, "User creation failed"));
    }

    const userResponse = {
        _id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        avatar: newUser.avatar,
    };

    res.status(201).json(
        new APIresponse(201, userResponse, "User registered successfully")
    );
});

// Function to handle user login
const loginUser = asynchandler(async (req, res, next) => {
    const { email, password } = req.body;
    console.log("user:", email);
    console.log("password:", password);

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

    console.log({ user: loggedInUser, accessToken, refreshToken });

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
    // Invalidate the access token (add to a blacklist)
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 }, // Remove refresh token
        $addToSet: { invalidatedTokens: req.token }, // Add access token to blacklist
    });

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: true,
        domain: "localhost", // Match the domain used when setting the cookie
        path: "/", // Match the path used when setting the cookie
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

    console.log("incoming refresh token:", incoming);

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

// Update account details
const update_account_details = asynchandler(async (req, res, next) => {
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
const change_Avatar = asynchandler(async (req, res, next) => {
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
const change_CoverImage = asynchandler(async (req, res, next) => {
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

// Get user channel details;; First aggregation pipeline
const get_user_profile = asynchandler(async (req, res, next) => {
    const { userName } = req.params;

    if (!userName?.trim()) {
        return next(new APIerror(400, "Username is missing"));
    }

    try {
        const channel = await User.aggregate([
            {
                $match: { userName },
            },
            {
                $lookup: {
                    from: "subscription",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscription",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribed",
                },
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    channelsSubscribedToCount: { $size: "$subscribed" },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                },
            },
        ]);

        if (!channel.length) {
            return next(new APIerror(404, "Channel does not exist"));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    channel[0],
                    "User channel fetched successfully"
                )
            ); // Return the first (and only) matched document
    } catch (error) {
        next(error); // Pass any aggregation errors to error-handling middleware
    }
});

// Get watch history;; Second aggregate pipeline
const get_watch_history = asynchandler(async (req, res, next) => {
    // Ensure the user is authenticated
    const userId = req.user?._id; // Assuming req.user is populated after authentication
    if (!userId) {
        return res
            .status(401)
            .json(new APIresponse(401, null, "Unauthorized access"));
    }

    try {
        // Aggregation pipeline to retrieve watch history with pagination
        const { page = 1, limit = 10 } = req.query; // Pagination parameters
        const skip = (page - 1) * limit;

        const watchHistory = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }, // Find user by ID
            },
            {
                $lookup: {
                    from: "videos", // Join with videos collection
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users", // Join with users collection to get video owner details
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            userName: 1,
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: "$owner", // Flatten owner array to a single object
                        },
                        {
                            $project: {
                                videoFile: 1,
                                thumbnail: 1,
                                title: 1,
                                description: 1,
                                duration: 1,
                                views: 1,
                                isPublished: 1,
                                createdAt: 1,
                                owner: 1, // Include owner details
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    watchHistory: {
                        $slice: ["$watchHistory", skip, limit],
                    }, // Pagination slice
                },
            },
            {
                $addFields: {
                    totalItems: { $size: "$watchHistory" }, // Count of total watched videos
                },
            },
        ]);

        // Check if watch history exists and return response
        if (
            !watchHistory ||
            !watchHistory.length ||
            !watchHistory[0].watchHistory.length
        ) {
            return res
                .status(404)
                .json(new APIresponse(404, null, "No watch history found"));
        }

        const historyData = watchHistory[0].watchHistory;
        const totalItems = watchHistory[0].totalItems;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json(
            new APIresponse(
                200,
                {
                    items: historyData,
                    currentPage: page,
                    totalPages,
                    totalItems,
                },
                "Watch history fetched successfully"
            )
        );
    } catch (error) {
        console.error("Error fetching watch history:", error);
        next(
            new APIerror(
                500,
                "Server error occurred while fetching watch history"
            )
        );
    }
});

export {
    change_Avatar,
    change_CoverImage,
    change_current_password,
    get_current_user,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    update_account_details,
    get_user_profile,
    get_watch_history,
};
