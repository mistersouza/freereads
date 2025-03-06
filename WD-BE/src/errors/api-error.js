/**
 * Custom error class that extends the built-in Error class.
 * Provides standardized error structure for API responses with consistent
 * status codes, resource names, and error status.
 * 
 * @extends {Error}
 */
class ApiError extends Error {
    /**
     * Create a new API error.
     * 
     * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
     * @param {string} resourceName - Name of the resource that caused the error (e.g., 'users', 'books', 'auth')
     */
    constructor(statusCode, resourceName) {
        super();
        /**
         * HTTP status code
         * @type {number}
         */
        this.statusCode = statusCode;
        
        /**
         * Resource name associated with the error
         * @type {string}
         */
        this.resourceName = resourceName;
        
        /**
         * Error status - 'fail' for client errors (4xx), 'error' for server errors (5xx)
         * @type {string}
         */
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Capture stack trace, excluding the constructor call from the stack
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;