/**
 * Custom error class that extends the built-in Error class.
 * Provides standardized error structure for API responses with consistent
 * status codes, resource names, and error status.
 * 
 * @extends {Error}
 */
class ApiError extends Error {
    /**
     * Create a new API error.
     * 
     * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
     * @param {string} resourceName - Name of the resource that caused the error (e.g., 'users', 'books', 'auth')
     */
    constructor(statusCode, resourceName) {
        super();
        /**
         * HTTP status code
         * @type {number}
         */
        this.statusCode = statusCode;
        
        /**
         * Resource name associated with the error
         * @type {string}
         */
        this.resourceName = resourceName;
        
        /**
         * Error status - 'fail' for client errors (4xx), 'error' for server errors (5xx)
         * @type {string}
         */
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Capture stack trace, excluding the constructor call from the stack
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Custom error class for JWT authentication errors. 
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
        this.message = message;
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

/**
 * Business Validation Error - for business rule violations
 */
class BusinessValidationError extends ApiError {
  /**
   * @param {string} resourceName - The resource where the validation occurred
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.message='Business validation failed.'] - Error message
   * @param {number} [options.statusCode=400] - HTTP status code
   * @param {Object} [options.details={}] - Extra details about the validation error
   */
  constructor(resourceName, options = {}) {
    const {
      statusCode = 400,
      message = 'Business validation failed.',
    } = options;

    super(statusCode, resourceName);
    this.name = 'BusinessValidationError';
    this.message = message;
  }
}

/**
 * Input Validation Error - for request input validation failures
 */
class InputValidationError extends ApiError {
  /**
   * @param {string} resourceName - The resource being validated
   * @param {Object} [options={}] - Configuration options
   * @param {Object} [options.fields={}] - Specific fields that failed validation
   * @param {string} [options.message='Input validation failed.'] - Custom error message
   * @param {number} [options.statusCode=400] - HTTP status code for the validation error
   */
  constructor(resourceName, options = {}) {
    const {
      statusCode = 400,
      message = 'Input validation failed.',
      fields = {},
    } = options;
    
    super(statusCode, resourceName);
    this.name = 'InputValidationError';
    this.message = message;
    this.fields = fields;
  }
}

export { 
    ApiError,
    JwtError,
    BusinessValidationError,
    InputValidationError
};
