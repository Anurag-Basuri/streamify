import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";

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
        await user.save({ validateBeforeSave: false }); // Save the updated user with the new refresh token

        // Return the tokens
        return { refreshToken, accessToken };
    } catch (error) {
        // Throw an API error for any failures
        throw new APIerror(500, "Something went wrong, please try again");
    }
};

export { generate_Access_Refresh_token };
