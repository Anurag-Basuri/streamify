import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadSingleFile } from "../middlewares/multer.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = Router();

// Generic file upload (authenticated)
router.post("/", requireAuth, uploadSingleFile, uploadFile);

export default router;
