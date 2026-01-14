// Custom API Error class for consistent error handling in the application
class ApiError extends Error {
    // Constructor for ApiError
    // statusCode: HTTP status code
    // message: Error message
    // errors: Array of detailed error messages
    // code: Optional machine-readable error code
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        code = null
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.code = code; // Machine-readable error code for client handling

        Error.captureStackTrace(this, this.constructor);
    }

    // Convert error to JSON for API responses
    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            success: this.success,
            errors: this.errors,
            code: this.code,
        };
    }
}

// Export both names for backward compatibility during migration
export { ApiError, ApiError as APIerror };
