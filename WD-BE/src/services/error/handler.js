import { 
    ApiError, 
    BusinessValidationError, 
    InputValidationError, 
    JwtError,
} from './classes/index.js';
import { DEFAULT_ERROR_MESSAGES, JWT_ERROR_MESSAGES } from './constants.js';
import { formatResponse } from './formatter.js';

/**
 * Sets up a middleware to unify and handle errors throughout the application.
 * 
 * @param {Object} [ERROR_MESSAGES={}] - Custom error messages to override default messages
 * @returns {Function} Express error handling middleware that processes and formats different types of errors
 */
const handleError = (ERROR_MESSAGES = {}) => {
    const {
        CAST_ERROR = DEFAULT_ERROR_MESSAGES.CAST_ERROR,
        NOT_FOUND = DEFAULT_ERROR_MESSAGES.NOT_FOUND,
        SERVER_ERROR = DEFAULT_ERROR_MESSAGES.SERVER_ERROR,
    } = ERROR_MESSAGES;

    return (error, request, response, next) => {
        // Set default status code if not already set
        error.statusCode ||= 500;

        const isApiError = error instanceof ApiError;
        if (isApiError) {
            error.message = ERROR_MESSAGES[error.statusCode] || error.message;
        }

        // Handle business validation errors
        if (error instanceof BusinessValidationError) {
            error.message = ERROR_MESSAGES[error.statusCode] || error.message;
        }

        // Handle input validation errors
        if (error instanceof InputValidationError) {
            error.message = ERROR_MESSAGES[error.statusCode] || error.message;
        }

        // Handle JWT authentication errors
        if (error instanceof JwtError) {
            error.message = JWT_ERROR_MESSAGES[error.errorType] || error.message;
        }

        // Handle mongoose invalid ID
        if (error.name === 'CastError') {
            error.statusCode = 400;
            error.message = CAST_ERROR;
        }
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            error.statusCode = 400;
            error.message = Object.values(error.errors).map(err => err.message).join(' | ');
        }

        // Handle 404 Not Found errors
        if (!isApiError && error.statusCode === 404) {
            error.message = NOT_FOUND;
        }
        
        // Handle server errors
        if (error.statusCode > 499) {
            error.message = SERVER_ERROR;
        }

        // Let the error response handler take care of sending the response
        formatResponse(error, request, response);
    };
};

export { handleError };