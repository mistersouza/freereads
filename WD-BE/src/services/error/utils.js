/**
 * Keeps error properties sleek and consistent.
 * 
 * @param {Error} error - The error object to modify
 * @param {number} statusCode - HTTP status code
 * @param {string} status - Error status (e.g., 'fail', 'error')
 * @param {string} message - Human-readable error message
 */
const setError = (error, statusCode, status, message) => {
    error.statusCode = statusCode;
    error.status = status;
    error.message = message;
    return error;
};

/**
 * Pulls out only the resource name from the request 
 * 
 * @param {Object} request - Express request object
 * @returns {string} Resource name (e.g., 'books', 'users', 'auth')
 */
const getResourceName = (request) => {
  const fullPath = request.originalUrl || '';

  const segments = fullPath.split('/').filter(Boolean);
  
  if (segments.length >= 3 && segments[0] === 'api' && segments[1].startsWith('v')) {
    return segments[2] || 'none';
  }
  
  // For non-versioned routes, fall back to the previous logic
  const baseUrl = request.baseUrl || '';
  const baseSegments = baseUrl.split('/').filter(Boolean);
  const resourceName = baseSegments[baseSegments.length - 1];
  
  return resourceName || 'none';
};

export { setError, getResourceName };