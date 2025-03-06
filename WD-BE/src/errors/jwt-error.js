import ApiError from './api-error.js';

/**
 * Custom error class for JWT authentication errors. 
 * Extends ApiError to maintain consistent error handling throughout the application.
 */
class JwtError extends ApiError {
    /**
     * Create a new JWT authentication error.
     * 
     * @param {string} errorType - Specific type of JWT error ('missing', 'expired', 'invalid')
     * @param {string} message - Human-readable error message to display to the client
     */
    constructor(errorType, message) {
        super(401, 'token');
        this.errorType = errorType;
        this.jwtError = true;
        this.customMessage = message;
        Error.captureStackTrace(this, this.constructor);
    }
    
    /**
     * Creates an error for missing JWT token scenarios.
     * @returns {JwtError} Error with 'missing' type
     */
    static missing() {
        return new JwtError('missing', 'Token\'s ghosted. Time for a new one!');
    }
    
    /**
     * Creates an error for expired JWT token scenarios.
     * @returns {JwtError} Error with 'expired' type
     */
    static expired() {
        return new JwtError('expired', 'Token\'s expired. Time for a fresh one!');
    }
    
    /**
     * Creates an error for invalid JWT token scenarios (malformed or tampered).
     * @returns {JwtError} Error with 'invalid' type
     */
    static invalid() {
        return new JwtError('invalid', 'Token trouble! It\'s off.');
    }
}

export default JwtError;