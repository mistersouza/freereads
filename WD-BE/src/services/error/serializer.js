import { ENV } from '../../config/env.js';

/**
* Streamlines error objects for consistency
*
* @param {Error} error - The error to serialize
* @param {boolean} includeStack - Whether to include stack trace
* @returns {Object} Serialized error object
*/
const serializeError = (error) => {
  const logErrorStack = ENV.NODE_ENV === 'development';

  return {
    statusCode: error.statusCode || error.status || 500,
    name: error.name || 'Error',
    message: error.message || 'Something went wrong.',
    errorType: error.errorType || 'unknown',
    context: error.context ?? undefined,
    summary: error.summary ?? undefined,
    fields: error.fields ?? undefined,
    validation: error.errors ?? undefined,
    ...(logErrorStack && { stack: error.stack })
  };
};

export { serializeError };