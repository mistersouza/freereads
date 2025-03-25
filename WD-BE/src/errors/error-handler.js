import { 
    ApiError,
    JwtError,
    InputValidationError,
    BusinessValidationError,
    setError,
    formatErrorResponse,
    DEFAULT_ERROR_MESSAGES
} from './index.js';


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
    } = ERROR_MESSAGES;

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

        // Handle business validation errors
        // findout wherent isntad of Bussinbvalinston isnt equalt to ApiError
        if (error instanceof BusinessValidationError) {
            setError(error, error.statusCode, 'fail', error.message);
        }

        // Handle input validation errors
        if (error instanceof InputValidationError) {
            setError(error, error.statusCode, 'fail', error.message);
        }

        // Handle JWT authentication errors
        if (error instanceof JwtError) {
            setError(error, 401, error.errorType, error.message);
        }

        // Handle mongoose invalid ID
        if (error.name === 'CastError') {
            setError(error, 400, 'fail', CAST_ERROR);
        }
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            setError(error, 400, 'fail', 
                Object.values(error.errors).map(err => err.message).join(' | ')
            );
        }

         // Handle 404 Not Found errors
        if (!isApiError && error.statusCode === 404) {
            setError(error, 404, 'fail', NOT_FOUND);
        }
        
        // Handle server errors
        if (error.statusCode > 499) {
            setError(error, error.statusCode, 'error', SERVER_ERROR);
        }

        // Let the error response handler take care of sending the response
        formatErrorResponse(error, request, response);
    }
};

export default normalizeError;
