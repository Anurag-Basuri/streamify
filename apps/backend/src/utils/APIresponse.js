// Define a standardized API response class
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

// Export both names for backward compatibility during migration
export { ApiResponse, ApiResponse as APIresponse };
