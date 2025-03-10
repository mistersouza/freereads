import { ApiError, JwtError, setError } from '../errors/index.js';
import { formatErrorResponse } from "./error-response-middleware.js";
import { DEFAULT_ERROR_MESSAGES } from '../errors/index.js';

/**
 * Creates a middleware function for handling various error types.
 * Accepts custom error messages that override defaults when provided.
 * 
 * @param {Object} ERROR_MESSAGES - Custom error messages for different error types
 * @returns {Function} Express error handling middleware function
 */
const normalizeError = (ERROR_MESSAGES = {}) => {
   const {
        CAST_ERROR = DEFAULT_ERROR_MESSAGES.CAST_ERROR,
        NOT_FOUND = DEFAULT_ERROR_MESSAGES.NOT_FOUND,
        SERVER_ERROR = DEFAULT_ERROR_MESSAGES.SERVER_ERROR,
    } = {};

    /**
     * Express error handling middleware
     * Normalizes different error types into a consistent format for client responses
     * 
     * @param {Error} error - Error object thrown in the application
     * @param {Object} request - Express request object
     * @param {Object} response - Express response object
     * @param {Function} next - Express next function
     */
    return (error, request, response, next) => {
        error.statusCode ||= 500;
        error.status ||= 'error';

        const isApiError = error instanceof ApiError;
        if (isApiError) {
            setError(
                error, 
                error.statusCode, 
                error.status, 
                ERROR_MESSAGES[error.statusCode] || error.message
            );
        }

         // Handle 404 Not Found errors
        if (!isApiError && error.statusCode === 404) {
            setError(error, 404, 'fail', NOT_FOUND);
        }
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            setError(error, 400, 'fail', 
                Object.values(error.errors).map(err => err.message).join(' | ')
            );
        }

        // Handle mongoose invalid ID
        if (error.name === 'CastError') {
            setError(error, 400, 'fail', CAST_ERROR);
        }

        // Handle JWT authentication errors
        if (error instanceof JwtError) {
            setError(error, 401, error.errorType, error.customMessage);
        }

        // Handle server errors
        if (error.statusCode > 499) {
            setError(error, error.statusCode, 'error', SERVER_ERROR);
        }

        // Let the error response handler take care of sending the response
        formatErrorResponse(error, request, response);
    }
};

export { normalizeError };
