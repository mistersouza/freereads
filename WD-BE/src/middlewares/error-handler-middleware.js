import ApiError from '../errors/api-error.js';
import errorResponseHandler from "./error-response-middleware.js";
import { setError } from "../helpers/error-helper.js";
import { DEFAULT_ERROR_MESSAGES } from '../constants/error-messages.js';

/**
 * Creates a middleware function for handling various error types.
 * @param {Object} ERROR_MESSAGES - Custom error messages for different error types
 * @returns {Function} Express error handling middleware function
 */
const errorHandler = (ERROR_MESSAGES = {}) => {
   const {
        CAST_ERROR = DEFAULT_ERROR_MESSAGES.CAST_ERROR,
        NOT_FOUND = DEFAULT_ERROR_MESSAGES.NOT_FOUND,
        SERVER_ERROR = DEFAULT_ERROR_MESSAGES.SERVER_ERROR,
        INVALID_TOKEN = DEFAULT_ERROR_MESSAGES.INVALID_TOKEN,
        EXPIRED_TOKEN = DEFAULT_ERROR_MESSAGES.EXPIRED_TOKEN
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
            setError(error, error.statusCode, 'error', SERVER_ERROR);
        }

        // Let the error response handler take care of sending the response
        errorResponseHandler(error, request, response);
    }
};

export default errorHandler;
