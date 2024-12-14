import { Router } from "express";
import { body } from "express-validator";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { validateResult } from "../middlewares/validate.middleware.js";
import {
    addComment,
    deleteComment,
    getEntityComments,
    updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

// verify if user is login
router.use(verifyAccessToken);

// get a comment
router.get("/:entityType/:entityId", getEntityComments);

// add a comment
router
    .route("/:entityType/:entityId")
    .post(
        body("content")
            .isString()
            .trim()
            .notEmpty()
            .withMessage("Comment is required"),
        validateResult,
        addComment
    );

// update a comment
router.put(
    "/:commentId",
    body("content")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Comment is required"),
    validateResult,
    updateComment
);

// delete a comment
router.delete("/:commentId", deleteComment);

export default router;
