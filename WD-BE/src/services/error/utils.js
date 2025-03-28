/**
 * Pulls out only the resource name from the request 
 * 
 * @param {Object} request - Express request object
 * @returns {string} Resource name (e.g., 'books', 'users', 'auth')
 */
const getResourceName = (request) => {
  // Get the complete URL path (originalUrl includes baseUrl + path)
  const fullPath = request.originalUrl || '';
  
  // Split the path and remove empty segments
  const segments = fullPath.split('/').filter(Boolean);
  
  // For API routes with pattern /api/v1/resource/...
  if (segments.length >= 3 && segments[0] === 'api' && segments[1].startsWith('v')) {
    return segments[2] || 'unknown';
  }
  
  return 'default';
};

export { getResourceName };