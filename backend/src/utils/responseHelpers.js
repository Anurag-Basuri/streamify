import { ApiResponse } from "./APIresponse.js";
import { ApiError } from "./APIerror.js";

// SUCCESS RESPONSES

// 200 OK - The request has succeeded
export const ok = (res, data = null, message = "Success") => {
    return res.status(200).json(new ApiResponse(200, data, message));
};

// 201 Created - The request has been fulfilled and resulted in a new resource being created
export const created = (res, data = null, message = "Created successfully") => {
    return res.status(201).json(new ApiResponse(201, data, message));
};

// 202 Accepted - The request has been accepted for processing, but the processing has not been completed
export const noContent = (res) => {
    return res.status(204).send();
};

// ============================================================================
// ERROR THROWERS (for use with asyncHandler)
// ============================================================================

// 400 Bad Request
export const badRequest = (
    message = "Bad request",
    errors = [],
    code = null
) => {
    throw new ApiError(400, message, errors, code);
};

// 401 Unauthorized
export const unauthorized = (
    message = "Unauthorized",
    code = "AUTH_REQUIRED"
) => {
    throw new ApiError(401, message, [], code);
};

// 403 Forbidden
export const forbidden = (message = "Access denied", code = "FORBIDDEN") => {
    throw new ApiError(403, message, [], code);
};

// 404 Not Found
export const notFound = (resource = "Resource", code = null) => {
    throw new ApiError(
        404,
        `${resource} not found`,
        [],
        code || `${resource.toUpperCase()}_NOT_FOUND`
    );
};

// 409 Conflict
export const conflict = (
    message = "Resource already exists",
    code = "CONFLICT"
) => {
    throw new ApiError(409, message, [], code);
};

// 422 Unprocessable Entity
export const unprocessable = (message = "Validation failed", errors = []) => {
    throw new ApiError(422, message, errors, "VALIDATION_ERROR");
};

// 429 Too Many Requests
export const tooManyRequests = (
    message = "Too many requests",
    code = "RATE_LIMITED"
) => {
    throw new ApiError(429, message, [], code);
};

// 500 Internal Server Error
export const serverError = (
    message = "Internal server error",
    code = "SERVER_ERROR"
) => {
    throw new ApiError(500, message, [], code);
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

// Validate MongoDB ObjectId format
export const validateObjectId = (id, fieldName = "ID") => {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        badRequest(`Invalid ${fieldName}`, [], "INVALID_OBJECT_ID");
    }
};

// Standardized existence check
export const ensureExists = (resource, resourceName = "Resource") => {
    if (!resource) {
        notFound(resourceName);
    }
    return resource;
};

// Standardized ownership check
export const ensureOwner = (
    resourceOwnerId,
    userId,
    resourceName = "resource"
) => {
    const ownerId = resourceOwnerId?.toString?.() || resourceOwnerId;
    const uid = userId?.toString?.() || userId;
    if (ownerId !== uid) {
        forbidden(`You don't have permission to modify this ${resourceName}`);
    }
};
