import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    const avatarLocalPath = req.files?.avatar?.[0];
    let avatarUrl = null;

    // Step 5: Upload avatar to Cloudinary (if provided)
    if (avatarLocalPath) {
        const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
        avatarUrl = avatarUploadResult.secure_url;
    } else {
        return next(new APIerror(400, "Avatar is required"));
    }

    // Step 6: Handle coverImage (optional)
    const coverImageLocalPath = req.files?.coverImage?.[0];
    let coverImageUrl = null;

    if (coverImageLocalPath) {
        const coverImageUploadResult =
            await uploadOnCloudinary(coverImageLocalPath);
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
        APIresponse(200, userResponse, "User registered successfully")
    );
});

export { registerUser };
