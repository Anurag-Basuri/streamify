import { asynchandler } from "../utils/asynchandler.js";

const registerUser = asynchandler(async (req, res) => {
    req.status(200).json({
        message: "ok",
    });
});
