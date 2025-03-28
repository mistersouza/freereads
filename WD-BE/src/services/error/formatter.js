import { ENV } from '../../config/env.js';
import { log } from './logger.js';
import { serializeError } from './serializer.js';

/**
 * Manages error responses
 * 
 * @param {Error} error - The error object.
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
const formatResponse = (error, request, response) => { 
    log.error(error);
    
    try {
        const metadata = serializeError(error);

        const errorResponse = {
            ...metadata,
            method: request.method || 'UNKNOWN',
            path: request.originalUrl || '/unknown/path',
            timestamp: new Date().toISOString(),
        };
        
        if (error.fields) errorResponse.fields = error.fields;
        
        log.warn(`Shipping back ${error.statusCode} response for ${request.method} @ ${request.originalUrl}`);
        
        response.status(error.statusCode).json(errorResponse);
    } catch (serializationError) {
        log.error(serializationError);
        
        response.status(500).send(
            'Something went sideways while handling the error. We\'re on it!'
        );
    }
}

export { formatResponse };
