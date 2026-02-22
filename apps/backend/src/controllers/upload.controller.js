import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const sanitizeUploadType = (uploadType) => {
    const raw = (uploadType || "misc").toString().trim().toLowerCase();
    const cleaned = raw.replace(/[^a-z0-9-_]/g, "");
    return cleaned || "misc";
};

const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "File is required");
    }

    const safeType = sanitizeUploadType(req.body?.uploadType);
    const folder = `streamify/${safeType}`;

    const result = await uploadOnCloudinary(req.file.path, {
        folder,
        resourceType: "auto",
    });

    if (!result?.secure_url) {
        throw new ApiError(500, "Upload failed");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
            },
            "File uploaded successfully"
        )
    );
});

export { uploadFile };
