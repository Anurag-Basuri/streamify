// Utility to handle asynchronous route handlers in Express.js
// Wraps async functions and forwards errors to Express error handlers
// Usage: const wrappedHandler = asyncHandler(async (req, res, next) => { ... });
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

// Export both names for backward compatibility during migration
export { asyncHandler, asyncHandler as asynchandler };
