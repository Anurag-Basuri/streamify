import { asynchandler } from "../utils/asynchandler.js";

const registerUser = asynchandler(async (req, res) => {
    // get user details from the frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images and avatar
    // upload them to the cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check user creation
    // return res

    const {fullName, email, userName, password} = req.body;
    console.log(req.body);
});

export { registerUser };
