// Utility to handle asynchronous request handlers in Express.js
// Catches errors and passes them to the next middleware
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

// Export both names for backward compatibility
export { asyncHandler, asyncHandler as asynchandler };
