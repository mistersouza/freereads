/**
 * Helper function to set error properties
 * @param {number} statusCode - HTTP status code
 * @param {string} status - Error status description
 * @param {string} message - Error message
 * @returns {Error} - Formatted error object
 */
const setError = (error, statusCode, status, message) => {
    error.statusCode = statusCode;
    error.status = status;
    error.message = message;
};

export { setError };
