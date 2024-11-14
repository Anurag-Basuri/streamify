import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "minimum 3"],
            maxlength: [30, "maximum 30"],
            match: [
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ],
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+\@.+\..+/, "Please enter a valid email address"],
        },
        fullName: {
            type: String,
            required: [true, "Full Name is required"],
            trim: true,
            minlength: [3, "minimum 3"],
            maxlength: [30, "maximum 30"],
            index: true,
        },
        avatar: {
            type: String, // Cloudinary URL
            required: true,
            match: [
                /^(https?:\/\/.*\.(?:png|jpg|jpeg))$/i,
                "Invalid URL format for avatar",
            ],
        },
        avatarPublicId: {
            type: String, // Cloudinary public ID for avatar image
            required: true,
        },
        coverImage: {
            type: String, // Cloudinary URL
            match: [
                /^(https?:\/\/.*\.(?:png|jpg|jpeg))$/i,
                "Invalid URL format for cover image",
            ],
        },
        coverImagePublicId: {
            type: String, // Cloudinary public ID for cover image
            required: true,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        return next(err);
    }
});

// Check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
