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
    return segments[2] || 'unknown';
  }
  
  return 'default';
};

/**
 * Refines validation errors, distinguishing between missing fields and format issues
 * 
 * @param {Array} errors - Array of validation errors from express-validator
 * @returns {Object} Object containing categorized errors
 */
const getInputErrors = (errors) => {
  const hasRequiredFieldErrors = errors.some(error => 
    error.msg && error.msg.startsWith('[REQUIRED]')
  );
  
  if (hasRequiredFieldErrors) {
    return {
      isFieldError: true,
      isFormatError: false,
      requiredFields: Object.fromEntries(
        errors
          .filter(error => error.msg && error.msg.startsWith('[REQUIRED]'))
          .map(error => [error.path, error.msg.replace('[REQUIRED] ', '')])
      ),
    };
  }

  return {
    isFieldError: false,
    isFormatError: true,
    formatErrors: Object.fromEntries(errors.map(error => [error.path, error.msg])),
  };
};

export { getResourceName, getInputErrors };