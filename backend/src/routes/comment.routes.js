import { Router } from "express";
import { body } from "express-validator";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { validateResult } from "../middlewares/validate.middleware.js";
import {
    addComment,
    deleteComment,
    getEntityComments,
    updateComment,
    toggleCommentLike,
    countComments
} from "../controllers/comment.controller.js";

const router = Router();

// Verify if user is logged in
router.use(verifyAccessToken);

// Get comments for an entity
router.get("/:entityType/:entityId", getEntityComments);

// Add a comment
router.post(
    "/:entityType/:entityId",
    body("content")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Comment is required"),
    validateResult,
    addComment
);

// Update a comment
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

// Delete a comment
router.delete("/:commentId", deleteComment);

// Toggle like for a comment
router.post("/like/:commentId", toggleCommentLike);

// count comments for an entity
router.get("/count/:entityType/:entityId", countComments);

export default router;
