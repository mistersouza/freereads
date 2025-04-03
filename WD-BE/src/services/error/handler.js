import { 
    ApiError, 
    BusinessValidationError, 
    InputValidationError, 
    JwtError,
} from './classes/index.js';
import { DOMAIN_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGES } from './constants.js';
import { formatResponse } from './formatter.js';

/**
 * Sets up a middleware to unify and handle errors throughout the application.
 * 
 * @param {Object} [ERROR_MESSAGES={}] - Custom error messages to override default messages
 * @returns {Function} Express error handling middleware that processes and formats different types of errors
 */
const handleError = (ERROR_MESSAGES = DOMAIN_ERROR_MESSAGES) => 
    (error, request, response, next) => {
        // Set default status code if not already set
        error.statusCode ||= 500;

        const domain = error.resource || 'DEFAULT';
        const messages = ERROR_MESSAGES[domain] || {};

        const isApiError = error instanceof ApiError;
        if (isApiError) {
            error.message = messages[error.statusCode] || error.message;
        }

        // Handle business validation errors
        if (error instanceof BusinessValidationError) {
            error.message = messages[error.statusCode] || error.message;
        }

        // Handle input validation errors
        if (error instanceof InputValidationError) {
            error.message = messages[error.statusCode] || error.message;
        }

        // Handle JWT authentication errors
        if (error instanceof JwtError) {
            error.message = messages[error.errorType] || error.message;
        }

        // Handle mongoose invalid ID
        if (error.name === 'CastError') {
            error.statusCode = 400;
            error.message = DEFAULT_ERROR_MESSAGES.CAST_ERROR;
        }
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            error.statusCode = 400;
            error.message = Object.values(error.errors).map(err => err.message).join(' | ');
        }

        // Handle 404 Not Found errors
        if (!isApiError && error.statusCode === 404) {
            error.message = DEFAULT_ERROR_MESSAGES.NOT_FOUND;
        }
        
        // Handle server errors
        if (error.statusCode > 499) {
            error.message = DEFAULT_ERROR_MESSAGES.SERVER_ERROR;
        }

        // Let the error response handler take care of sending the response
        formatResponse(error, request, response);
    };

export { handleError };