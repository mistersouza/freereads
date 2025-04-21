import {
  ApiError,
  BusinessValidationError,
  InputValidationError,
  JwtError,
} from './classes/index.js';
import { DOMAIN_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGES } from './constants.js';
import { formatResponse } from './formatter.js';

/**
 * Sets up a middleware to unify and handle errors throughout the application.
 *
 * @param {Object} [MESSAGES={}] - Custom error messages to override default messages
 * @returns {Function} Express middleware that handles and formats various errors
 */
const handleError = (MESSAGES = DOMAIN_ERROR_MESSAGES) => (error, request, response, _next) => {
  const metadata = {
    ...error,
    statusCode: error.statusCode || 500,
  };

  const domain = metadata.resource || 'DEFAULT';
  const messages = MESSAGES[domain] || {};

  const isApiError = error instanceof ApiError;
  if (isApiError) {
    metadata.message = messages[metadata.statusCode] || metadata.message;
  }

  if (error instanceof BusinessValidationError) {
    metadata.message = messages[metadata.statusCode] || metadata.message;
  }

  if (error instanceof InputValidationError) {
    metadata.message = messages[metadata.statusCode] || metadata.message;
  }

  if (error instanceof JwtError) {
    metadata.message = messages[metadata.errorType] || metadata.message;
  }

  if (error.name === 'CastError') {
    metadata.statusCode = 400;
    metadata.message = DEFAULT_ERROR_MESSAGES.CAST_ERROR;
  }

  if (error.name === 'ValidationError') {
    metadata.statusCode = 400;
    metadata.message = Object.values(error.errors)
      .map((err) => err.message)
      .join(' | ');
  }

  if (!isApiError && metadata.statusCode === 404) {
    metadata.message = DEFAULT_ERROR_MESSAGES.NOT_FOUND;
  }

  if (metadata.statusCode > 499) {
    metadata.message = DEFAULT_ERROR_MESSAGES.SERVER_ERROR;
  }

  formatResponse(metadata, request, response);
};

export { handleError };
