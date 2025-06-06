import { validationResult } from "express-validator";
import { APIerror } from "../utils/APIerror.js";
import { asynchandler } from "../utils/asynchandler.js";

const validateResult = asynchandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If validation errors exist, return a 400 response with the error details
            const errorMessages = errors.array().map((err) => ({
                field: err.param,
                message: err.msg,
            }));

            console.log("Validation errors:", errorMessages);
            return next(new APIerror(400, "Validation Error", errorMessages));
        }
        next(); // Proceed if no errors
    }

    console.log("_________validation is completed_________");
    next();
});

export { validateResult };
