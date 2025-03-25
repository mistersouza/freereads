import { ENV } from '../config/env.js';
/**
* Serializes error objects into a consistent format
* @param {Error} error - The error to serialize
* @param {boolean} includeStack - Whether to include stack trace
* @returns {Object} Serialized error object
*/

const serializeError = (error, logErrorStack = ENV.NODE_ENV === 'development') => {
  const metadata = {
    name: error.name || 'Error',
    code: error.code,
    statusCode: error.statusCode || error.status || 500
  };

  if (logErrorStack) metadata.stack = error.stack;
  if (error.errors) metadata.validation = error.errors;

  return { message: error.message || 'Unknown error', metadata };
};

export default serializeError;