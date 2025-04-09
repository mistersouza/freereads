/**
 * Tailored error class extending JavaScript's native Error.
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
   * @param {string} resourceName - The resource causing the error (e.g., 'users', 'books', 'auth')
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
    this.resource = resourceName;

    /**
         * Error status - 'fail' for client errors (4xx), 'error' for server errors (5xx)
         * @type {string}
         */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    /**
         * Error type identifier
         * @type {string}
         */
    this.errorType = 'api';

    // Capture stack trace, excluding the constructor call from the stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
     * Create a not found error
     * @param {string} resourceName - The resource that wasn't found
     * @param {string} [message] - Optional custom message
     * @returns {ApiError} Error with 404 status code
     */
  static notFound(resourceName, message) {
    const error = new ApiError(404, resourceName);
    error.message = message || `No sign of ${resourceName}. Try again?`;
    return error;
  }

  /**
     * Create a server error
     * @param {string} resourceName - The related resource
     * @param {string} [message] - Optional custom message
     * @returns {ApiError} Error with 500 status code
     */
  static serverError(resourceName, message) {
    const error = new ApiError(500, resourceName);
    error.message = message || 'Something\'s acting up on our end. We\'re on it!';
    return error;
  }
}

export { ApiError };
