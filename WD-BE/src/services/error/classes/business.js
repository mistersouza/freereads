import { ApiError } from "./api.js";
/**
 * Business Validation Error - for business rule violations
 */
class BusinessValidationError extends ApiError {
  /**
   * @param {string} resourceName - The resource where the validation occurred
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.message='Business validation failed.'] - Error message
   * @param {number} [options.statusCode=400] - HTTP status code
   * @param {Object} [options.context={}] - Additional business context
   */
  constructor(resourceName, options = {}) {
    const {
      statusCode = 400,
      message = 'Business validation failed.',
      context = {}
    } = options;

    super(statusCode, resourceName);
    this.name = 'BusinessValidationError';
    this.message = message;
    this.errorType = 'business';
    this.context = {
      domain: resourceName,
      ...context
    };
  }
  
  /**
   * Create a permission denied error
   * @param {string} resourceName - The resource being accessed
   * @param {string} [message] - Optional custom message
   * @returns {BusinessValidationError} Error with 403 status code
   */
  static forbidden(resourceName, message) {
    return new BusinessValidationError(resourceName, {
      statusCode: 403,
      message: message || 'You don\'t have permission to perform this action.',
      context: { issue: 'permission' }
    });
  }
  
  /**
   * Create a conflict error
   * @param {string} resourceName - The resource with conflict
   * @param {string} [message] - Optional custom message
   * @returns {BusinessValidationError} Error with 409 status code
   */
  static conflict(resourceName, message) {
    return new BusinessValidationError(resourceName, {
      statusCode: 409,
      message: message || 'This operation would create a conflict.',
      context: { issue: 'conflict' }
    });
  }
}

export { BusinessValidationError };