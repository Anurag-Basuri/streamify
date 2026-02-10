import { Router } from "express";
import { body } from "express-validator";
import {
    verifyAccessToken,
    requireAuth,
} from "../middlewares/auth.middleware.js";
import { validateResult } from "../middlewares/validate.middleware.js";
import {
    addComment,
    deleteComment,
    getEntityComments,
    updateComment,
    countComments,
    getCommentReplies,
    togglePinComment,
    toggleHeartComment,
} from "../controllers/comment.controller.js";

const router = Router();

// Handle base route for comments
router.get("/", (req, res) => {
    res.status(400).json({
        success: false,
        message: "Please specify an entityType and entityId",
    });
});

// Count comments for an entity (public)
router.get("/count/:entityType/:entityId", verifyAccessToken, countComments);

// Get replies for a comment (public; optional auth for isLiked)
router.get("/replies/:commentId", verifyAccessToken, getCommentReplies);

// Get comments for an entity (public; optional auth for isLiked)
router.get("/:entityType/:entityId", verifyAccessToken, getEntityComments);

// Add a comment (auth required)
router.post(
    "/:entityType/:entityId",
    requireAuth,
    body("content")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Comment is required"),
    validateResult,
    addComment
);

// Update a comment (auth required)
router.put(
    "/:commentId",
    requireAuth,
    body("content")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Comment is required"),
    validateResult,
    updateComment
);

// Delete a comment (auth required)
router.delete("/:commentId", requireAuth, deleteComment);

// Toggle pin on a comment (auth required - content owner only)
router.post("/:commentId/pin", requireAuth, togglePinComment);

// Toggle heart on a comment (auth required - content owner only)
router.post("/:commentId/heart", requireAuth, toggleHeartComment);

export default router;
