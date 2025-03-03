/**
 * Custom error class that extends the built-in Error class, 
 * and provides additional properties to help with error handling
 * and response formatting.
 */
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;