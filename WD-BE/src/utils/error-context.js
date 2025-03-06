/**
 * Helper function to standardize error properties across the application.
 * Modifies the error object in place by setting common properties used in error responses.
 * 
 * @param {Error} error - The error object to modify
 * @param {number} statusCode - HTTP status code to set
 * @param {string} status - Error status description ('fail' or 'error')
 * @param {string} message - Human-readable error message for client response
 */
const setError = (error, statusCode, status, message) => {
    error.statusCode = statusCode;
    error.status = status;
    error.message = message;
};
/**
 * Extracts just the resource name from the request URL
 * 
 * @param {Object} request - Express request object
 * @returns {string} Resource name (e.g., 'books', 'users', 'auth')
 */
const getResourceName = (request) => {
  // Get the complete URL path (originalUrl includes baseUrl + path)
  const fullPath = request.originalUrl || '';
  
  // Split the path and remove empty segments
  const segments = fullPath.split('/').filter(Boolean);
  
  // For API routes with version (like /api/v1/books/scan)
  if (segments.length >= 3 && segments[0] === 'api' && segments[1].startsWith('v')) {
    // Return the resource type (3rd segment in /api/v1/books/...)
    return segments[2] || 'default';
  }
  
  // For non-versioned routes, fall back to the previous logic
  const baseUrl = request.baseUrl || '';
  const baseSegments = baseUrl.split('/').filter(Boolean);
  const resourceName = baseSegments[baseSegments.length - 1];
  
  return resourceName || 'default';
};

export { setError, getResourceName };
