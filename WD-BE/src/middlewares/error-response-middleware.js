import { ENV } from '../config/env.js';

/**
 * Handles error response.
 * @param {Error} error - The error object.
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 * @returns {Object} - The response object.
 */
const errorResponseHandler = (error, request, response) => {
    try {
        response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: request.originalUrl || null,
        stack: ENV.NODE_ENV === 'development' ? error.stack : null
    });
    } catch (serializationError) {
        console.error('Serialization failed', serializationError);
        response.status(500).send(
            'Something went sideways while handling the error. We\'re on it!'
        );
    }
    console.error(`[ERROR] ${error.statusCode} - ${error.message}`, error);
}

export default errorResponseHandler;
