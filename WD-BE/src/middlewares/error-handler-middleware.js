import errorResponseHandler from "./error-response-middleware.js";
import { setError } from "../helpers/error-helper.js";

/**
 * Creates a middleware function for handling various error types.
 * @param {Object} ERROR_MESSAGES - Custom error messages for different error types
 * @returns {Function} Express error handling middleware function
 */
const errorHandler = (ERROR_MESSAGES = {}) => {
   const {
        CAST_ERROR = "Hmm… this ID seems off. It doesn't match any records",
        NOT_FOUND = "404 vibes—this one's gone missing!",
        SERVER_ERROR = "Bookkeeper's out! Please knock again later."
        INVALID_TOKEN = "Token trouble! It's off.",
        EXPIRED_TOKEN = "Token's expired. Time for a fresh one!"
    } = ERROR_MESSAGES;


    /**
     * Express error handling middleware
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
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            setError(error, 401, 'fail', 
                error.expiredAt 
                    ? EXPIRED_TOKEN
                    : INVALID_TOKEN
            );
        }

        // Handle 404 Not Found errors
        if (error.statusCode === 404 && !isApiError) {
            setError(error, 404, 'fail', NOT_FOUND);
        }

        // Handle server errors
        if (error.statusCode > 499) {
            setError(error, 500, 'error', SERVER_ERROR);
        }

        // Let the error response handler take care of sending the response
        errorResponseHandler(error, request, response);
    }
};

export default errorHandler;
