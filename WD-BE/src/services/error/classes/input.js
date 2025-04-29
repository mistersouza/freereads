import { ApiError } from './api.js';
import { lingo } from '../../lingo/index.js';

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
      locale = 'en',
      fields = {},
    } = options;

    super(statusCode, resourceName);
    this.name = 'InputValidationError';
    this.message = lingo.translateMessage(message, locale);
    this.errorType = 'validation';
    this.context = {
      domain: resourceName,
    };
    this.fields = lingo.translateFieldMessages(fields, locale);

    if (Object.keys(fields).length) {
      this.summary = {
        fields: Object.keys(fields),
        count: Object.keys(fields).length,
      };
    }
  }

  /**
   * Create an error for missing required fields
   * @param {string} resourceName - The resource being validated
   * @param {string[]} missingFields - Array of missing field names
   * @returns {InputValidationError} Validation error with fields populated
   */
  static requiredField(resourceName, locale, requiredFields) {
    return new InputValidationError(resourceName, {
      message: 'Required fields are missing.',
      locale,
      fields: requiredFields,
    });
  }

  /**
   * Create an error for invalid field formats
   * @param {string} resourceName - The resource being validated
   * @param {Object} invalidFields - Object mapping field names to error messages
   * @returns {InputValidationError} Validation error with fields populated
   */
  static invalidFormat(resourceName, locale, invalidFields) {
    return new InputValidationError(resourceName, {
      message: 'Invalid formats.',
      locale,
      fields: invalidFields,
    });
  }
}

export { InputValidationError };
