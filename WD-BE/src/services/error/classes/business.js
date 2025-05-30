import { ApiError } from './api.js';
/**
 * Business Rule Breach – Validation Error
 * @extends ApiError
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
      context = {},
    } = options;

    super(statusCode, resourceName);
    this.name = 'BusinessValidationError';
    this.errorType = 'business';
    this.context = {
      domain: resourceName,
      ...context,
    };
  }

  /**
   * Permission Error
   * @param {string} resourceName - The resource being accessed
   * @returns {BusinessValidationError} Error with 403 status code
   */
  static forbidden(resourceName) {
    return new BusinessValidationError(resourceName, {
      statusCode: 403,
      context: { issue: 'permission' },
    });
  }

  /**
   * Conflict error
   * @param {string} resourceName - The resource with conflict
   * @returns {BusinessValidationError} Error with 409 status code
   */
  static conflict(resourceName) {
    return new BusinessValidationError(resourceName, {
      statusCode: 409,
      context: { issue: 'conflict' },
    });
  }

  /**
   * Not found error
   * @param {string} resourceName - The resource not found
   * @returns {BusinessValidationError} Error with 404 status code
   */
  static notFound(resourceName) {
    return new BusinessValidationError(resourceName, {
      statusCode: 404,
      context: { issue: 'not_found' },
    });
  }

  /**
   * Unauthorized error
   * @param {string} resourceName - The resource requiring authorization
   * @returns {BusinessValidationError} Error with 401 status code
   */
  static unauthorized(resourceName) {
    return new BusinessValidationError(resourceName, {
      statusCode: 401,
      context: { issue: 'authentication' },
    });
  }

  /**
   * Unprocessable entity error
   * @param {string} resourceName - The resource that cannot be processed
   * @returns {BusinessValidationError} Error with 422 status code
   */
  static unprocessableEntity(resourceName) {
    return new BusinessValidationError(resourceName, {
      statusCode: 422,
      context: { issue: 'unprocessable_entity' },
    });
  }
}

export { BusinessValidationError };
