import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Generate Refresh and Access token
const generate_Access_Refresh_token = async (userID) => {
    try {
        // Fetch user by ID
        const user = await User.findById(userID);

        // Check if the user exists
        if (!user) {
            throw new APIerror(404, "User not found");
        }

        // Generate access and refresh tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Assign refresh token to the user and save
        user.refreshToken = refreshToken;
        await user.save(); // Save the updated user with the new refresh token

        // Return the tokens
        return { refreshToken, accessToken };
    } catch (error) {
        // Throw an API error for any failures
        throw new APIerror(500, "Something went wrong, please try again");
    }
};


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

    // step 3: Check the user name and email if they are in the registered
    const user = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!user) {
        throw new APIerror(404, "User does not exist");
    }

    // step 4: If the user exists then validate the password
    const pswd = await user.isPasswordCorrect(password);

    if (!pswd) {
        return next(new APIerror(401, "Incorrect password"));
    }

    //
});

export { registerUser };
