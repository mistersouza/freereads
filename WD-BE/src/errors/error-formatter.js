import { ENV } from '../config/env.js';
import { log } from '../errors/index.js';

/**
 * Handles error response.
 * @param {Error} error - The error object.
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
const formatErrorResponse = (error, request, response) => {
    const path = request.originalUrl || '/unknown/path';
    const method = request.method || 'UNKNOWN';
    
    log.error(error);
    log.debug(`Uh-oh! Something’s off. Formatting error response for ${method} @ ${path}`);
    
    try {
        log.info(`Shipping back ${error.statusCode} response for ${request.method} @ ${request.originalUrl}`);

        response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            timestamp: new Date().toISOString(),
            path: request.originalUrl || null,
            stack: ENV.NODE_ENV === 'development' ? error.stack : null
        });
    } catch (serializationError) {
        log.error(serializationError);
        log.warn(`Defaulting to a simple error response for ${request.originalUrl}`);

        response.status(500).send(
            'Something went sideways while handling the error. We\'re on it!'
        );
    }
}

export default formatErrorResponse;
